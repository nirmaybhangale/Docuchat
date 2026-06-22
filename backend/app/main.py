from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from pypdf import PdfReader
import io
from fastapi.middleware.cors import CORSMiddleware
from app.ingest import chunk_text, embed_chunks
from app.db import search_similar_chunks, insert_chunk
from app.rag import generate_answer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    question: str


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/ask")
def ask(request: AskRequest):
    query_embedding = embed_chunks([request.question])[0]
    results = search_similar_chunks(query_embedding, top_k=3)
    context_chunks = [chunk_text for chunk_text, doc_name, similarity in results]
    answer = generate_answer(request.question, context_chunks)

    sources = [
        {"chunk_text": chunk_text, "document_name": doc_name, "similarity": similarity}
        for chunk_text, doc_name, similarity in results
    ]

    return {
        "question": request.question,
        "answer": answer,
        "sources": sources
    }


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # 1. Read the raw bytes of the uploaded file
    file_bytes = await file.read()

    # 2. Wrap those bytes so pypdf can treat them like a file
    pdf_stream = io.BytesIO(file_bytes)

    # 3. Extract text from every page
    reader = PdfReader(pdf_stream)
    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text() + "\n"

    # 4. Split the full text into overlapping chunks
    chunks = chunk_text(full_text)

    # 5. Convert all chunks into embedding vectors in one batch
    embeddings = embed_chunks(chunks)

    # 6. Store each chunk + its embedding in Postgres
    for chunk, embedding in zip(chunks, embeddings):
        insert_chunk(file.filename, chunk, embedding)

    return {
        "filename": file.filename,
        "num_pages": len(reader.pages),
        "num_chunks_stored": len(chunks)
    }