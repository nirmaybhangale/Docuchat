from app.ingest import embed_chunks
from app.db import search_similar_chunks
from app.rag import generate_answer

def ask(question: str):
    # 1. Embed the question
    query_embedding = embed_chunks([question])[0]

    # 2. Retrieve relevant chunks from Postgres
    results = search_similar_chunks(query_embedding, top_k=3)
    context_chunks = [chunk_text for chunk_text, doc_name, similarity in results]

    # 3. Generate a grounded answer using Groq
    answer = generate_answer(question, context_chunks)

    print(f"Question: {question}\n")
    print(f"Answer: {answer}\n")
    print("--- Sources used ---")
    for chunk_text, doc_name, similarity in results:
        print(f"[{similarity:.4f}] {chunk_text.strip()}")

ask("What is Docker used for?")