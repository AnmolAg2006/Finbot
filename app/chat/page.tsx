"use client";

import { useState, FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

type Message = {
  role: "user" | "bot";
  text: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi, I'm Finbot's Gemini assistant. Ask me anything about investing, savings, or your portfolio.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            data.reply ??
            "Sorry, I couldn't generate a response. Please try again.",
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            "Error talking to Finbot AI. Please check your connection or try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#02040a] px-4 py-6">
      {/* Top bar with home / back link */}
      <div className="max-w-5xl mx-auto mb-10 flex items-center justify-between 
  backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-6 py-4 shadow-lg">
  
  <Link href="/" className="text-xl font-semibold text-white tracking-wide">
    Finbot
  </Link>

  <Link
    href="/"
    className="text-xs sm:text-sm px-4 py-2 rounded-full bg-blue-600 text-white 
    hover:bg-blue-500 transition shadow-md"
  >
    ← Back to Dashboard
  </Link>
</div>
    
      {/* Centered chat card */}
      <div className="w-full flex items-center justify-center">
        <div className="w-full max-w-3xl rounded-2xl bg-[#0b0f1a] border border-gray-800 shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <header className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold text-white">
                AI
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Finbot AI Chat
                </h1>
                <p className="text-xs text-gray-400">
                  Ask questions about stocks, risk, saving vs investing, and
                  more.
                </p>
              </div>
            </div>
          </header>

          {/* Messages */}
          <section className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-[#101626] text-gray-100"
                  }`}
                >
                  {m.role === "user" ? (
                    <p>{m.text}</p>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  AI
                </div>
                <div className="flex gap-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
          </section>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="px-6 py-4 border-t border-gray-800 flex gap-3 bg-[#050814]"
          >
            <input
              className="flex-1 rounded-full bg-[#050814] border border-gray-700 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
              placeholder='Ask Finbot something like “Should I invest or keep it in savings?”'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-full bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60 transition"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
