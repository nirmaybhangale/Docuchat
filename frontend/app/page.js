"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const fileInputRef = useRef(null);

  async function handleAsk() {
    const askedQuestion = question;
    setLoading(true);
    setQuestion("");

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: askedQuestion }),
    });

    const data = await response.json();

    setHistory((previousHistory) => [
      ...previousHistory,
      { question: askedQuestion, answer: data.answer, sources: data.sources },
    ]);
    setLoading(false);
  }

  async function handleUpload() {
    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setUploadStatus(`Stored ${data.num_chunks_stored} chunks from ${data.filename}`);
    setUploading(false);
    setFile(null);
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-12">
      <h1 className="text-2xl font-bold">DocuChat</h1>

      <div className="flex w-full max-w-xl items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
        >
          Choose File
        </button>

        <span className="flex-1 truncate text-sm text-gray-600">
          {file ? file.name : "No file chosen"}
        </span>

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
        >
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>

      {uploadStatus && <p className="text-sm text-gray-600">{uploadStatus}</p>}

      <hr className="w-full max-w-xl border-gray-200" />

      <div className="flex w-full max-w-xl gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading && question.trim() !== "") {
              handleAsk();
            }
          }}
          placeholder="Ask a question about your documents..."
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button
          onClick={handleAsk}
          disabled={loading || question.trim() === ""}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Asking..." : "Ask"}
        </button>
      </div>

      <div className="flex w-full max-w-xl flex-col gap-4">
        {history
          .slice()
          .reverse()
          .map((entry, index) => (
            <div key={index} className="w-full rounded border border-gray-300 p-4">
              <p className="font-semibold text-blue-700">Q: {entry.question}</p>
              <p className="mt-2 font-semibold">Answer</p>
              <p className="mt-1">{entry.answer}</p>

              <p className="mt-4 font-semibold">Sources</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-gray-600">
                {entry.sources.map((source, sourceIndex) => (
                  <li key={sourceIndex}>
                    [{source.document_name}] (similarity: {source.similarity.toFixed(2)}) -{" "}
                    {source.chunk_text.slice(0, 100)}...
                  </li>
                ))}
              </ul>
            </div>
          ))}

        {loading && (
          <div className="w-full rounded border border-gray-300 p-4 text-gray-500">
            Thinking...
          </div>
        )}
      </div>
    </main>
  );
}