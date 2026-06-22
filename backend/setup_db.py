from app.db import get_connection

conn = get_connection()
cur = conn.cursor()

# Enable the pgvector extension (only needs to run once per database)
cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")

# Create our table for storing document chunks + their embeddings
cur.execute("""
    CREATE TABLE IF NOT EXISTS document_chunks (
        id SERIAL PRIMARY KEY,
        document_name TEXT,
        chunk_text TEXT,
        embedding VECTOR(384)
    );
""")

conn.commit()
cur.close()
conn.close()

print("Database setup complete: extension enabled, table created.")