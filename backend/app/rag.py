import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()  # reads the .env file and loads its values into the environment

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def generate_answer(question: str, context_chunks: list[str]) -> str:
    """
    Sends the question + retrieved chunks to Groq's LLM and returns a grounded answer.
    """
    context = "\n\n".join(context_chunks)

    prompt = f"""Answer the question using ONLY the context below. 
If the answer isn't in the context, say "I don't have enough information to answer that."

Context:
{context}

Question: {question}

Answer:"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    return response.choices[0].message.content