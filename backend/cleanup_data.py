from app.db import delete_chunks_by_document

deleted = delete_chunks_by_document("sample.txt")
print(f"Deleted {deleted} chunks for sample.txt")