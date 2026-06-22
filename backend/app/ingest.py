import numpy as np

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """
    Splits text into overlapping chunks.
    chunk_size: max characters per chunk
    overlap: how many characters repeat between consecutive chunks
    """
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap

    return chunks

from sentence_transformers import SentenceTransformer

# Load the model once — this downloads ~80MB the first time, then caches it
model = SentenceTransformer("all-MiniLM-L6-v2")

def embed_chunks(chunks: list[str]) -> list[list[float]]:
    """
    Converts a list of text chunks into a list of embedding vectors.
    Each vector has 384 numbers (this model's fixed output size).
    """
    embeddings = model.encode(chunks)
    return embeddings.tolist()  # convert from numpy array to plain Python lists

def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """
    Measures how similar two vectors are, based on the angle between them.
    Returns a value from -1 (opposite) to 1 (identical).
    """
    a = np.array(vec_a)
    b = np.array(vec_b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

