from app.db import get_connection

def show_document_summary():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT document_name, COUNT(*) AS num_chunks
        FROM document_chunks
        GROUP BY document_name;
        """
    )

    rows = cur.fetchall()
    cur.close()
    conn.close()

    print("Documents currently stored:\n")
    for document_name, num_chunks in rows:
        print(f"  {document_name}: {num_chunks} chunks")

show_document_summary()