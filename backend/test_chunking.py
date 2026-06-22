from app.ingest import chunk_text, embed_chunks, cosine_similarity

chunks = [
    "The cat sat on the mat.",
    "Stock markets fell sharply due to inflation fears.",
    "Dogs are loyal companions and popular pets.",
    "The Federal Reserve raised interest rates yesterday.",
    "A feline rested lazily on the rug all afternoon."
]
chunk_embeddings = embed_chunks(chunks)

query = "Tell me about cats"
query_embedding = embed_chunks([query])[0]

for chunk, emb in zip(chunks, chunk_embeddings):
    score = cosine_similarity(query_embedding, emb)
    print(f"{score:.4f}  |  {chunk}")