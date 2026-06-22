from app.ingest import embed_chunks
from app.db import search_similar_chunks

query = "Tell me about containers and Docker"
query_embedding = embed_chunks([query])[0]

results = search_similar_chunks(query_embedding, top_k=3)

print(f"Query: {query}\n")
for chunk_text, doc_name, similarity in results:
    print(f"{similarity:.4f}  |  {chunk_text.strip()}")