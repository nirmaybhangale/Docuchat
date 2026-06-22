from app.ingest import chunk_text, embed_chunks
from app.db import insert_chunk

sample_document = """
Python is a popular programming language known for its readability.
It is widely used in web development, data science, and automation.
Postgres is a powerful open-source relational database.
It supports advanced features like full-text search and JSON storage.
Docker allows developers to package applications into containers.
This makes it easy to run software consistently across different machines.
"""

chunks = chunk_text(sample_document, chunk_size=80, overlap=10)
embeddings = embed_chunks(chunks)

for chunk, embedding in zip(chunks, embeddings):
    insert_chunk(document_name="sample.txt", chunk_text=chunk, embedding=embedding)

print(f"Inserted {len(chunks)} chunks into the database.")