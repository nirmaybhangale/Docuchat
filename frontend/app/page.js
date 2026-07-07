"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [expandedSource, setExpandedSource] = useState(null);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

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

  function toggleSource(historyIndex, sourceIndex) {
    const key = `${historyIndex}-${sourceIndex}`;
    setExpandedSource(expandedSource === key ? null : key);
  }

  return (
    <main
  className="flex min-h-screen flex-col bg-cover bg-center bg-fixed"
  style={{
    backgroundImage:
      "url('https://images.unsplash.com/photo-1741412520436-cf74b9a1bc00?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
  }}>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/20 bg-white/5 px-6 py-3 backdrop-blur-xl">
        <h1 className="text-base font-medium text-white-900">DocuChat</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-white-700 hover:bg-gray-800 hover:text-white-900"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
          Add document
        </button>
      </header>

      {/* Conversation column */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 pb-32 pt-8">
        {history.length === 0 && !loading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p className="text-lg font-medium text-white-900">Ask something about your documents...</p>
            <p className="text-sm text-white-500">
              Upload a PDF on the button located in top-right, then ask a question. Answers are grounded in what you upload.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-8">
          {history.map((entry, historyIndex) => (
            <div key={historyIndex} className="flex flex-col gap-3">
              {/* User question */}
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl bg-black px-4 py-2.5 text-[15px] text-white">
                  {entry.question}
                </div>
              </div>

              {/* Assistant answer, no bubble, reads like plain text */}
              <div className="flex flex-col gap-3">
                <p className="text-[15px] leading-7 text-white-900">{entry.answer}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-400" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-400 [animation-delay:300ms]" />
            </div>
          )}
        </div>
      </div>

      {/* Sticky input */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-6 py-4">
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
            className="flex-1 rounded-full border border-gray-600 px-4 py-2.5 text-[15px] text-white placeholder:text-gray-550 outline-none focus:border-gray-400"
          />
          <button
            onClick={handleAsk}
            disabled={loading || question.trim() === ""}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-gray-700 disabled:bg-none"
            aria-label="Send question"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Upload modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-medium text-gray-900">Add a document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-50"
            >
              {file ? file.name : "Choose a PDF file"}
            </button>

            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

            {uploadStatus && <p className="mt-3 text-sm text-gray-500">{uploadStatus}</p>}
          </div>
        </div>
      )}
    </main>
  );
}