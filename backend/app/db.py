import os
import psycopg2

def get_connection():
    """
    Opens a connection to our Postgres database.

    Reads connection details from environment variables, falling back
    to your existing local defaults if those variables aren't set.
    This lets the exact same code work both when running locally on
    Windows and when running inside a Docker container.
    """
    return psycopg2.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        port=os.environ.get("DB_PORT", "5433"),
        dbname=os.environ.get("DB_NAME", "docuchat"),
        user=os.environ.get("DB_USER", "admin"),
        password=os.environ.get("DB_PASSWORD", "admin")
    )

def insert_chunk(document_name: str, chunk_text: str, embedding: list[float]):
    """
    Inserts one chunk and its embedding into the database.
    """
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO document_chunks (document_name, chunk_text, embedding)
        VALUES (%s, %s, %s);
        """,
        (document_name, chunk_text, embedding)
    )

    conn.commit()
    cur.close()
    conn.close()

def search_similar_chunks(query_embedding: list[float], top_k: int = 3):
    """
    Finds the top_k most similar chunks to the query embedding using pgvector.
    """
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT chunk_text, document_name, 1 - (embedding <=> %s::vector) AS similarity
        FROM document_chunks
        ORDER BY embedding <=> %s::vector
        LIMIT %s;
        """,
        (query_embedding, query_embedding, top_k)
    )

    results = cur.fetchall()
    cur.close()
    conn.close()
    return results

def delete_chunks_by_document(document_name: str):
    """
    Deletes all chunks belonging to a specific document.
    Returns the number of rows deleted.
    """
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "DELETE FROM document_chunks WHERE document_name = %s;",
        (document_name,)
    )

    deleted_count = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()

    return deleted_count