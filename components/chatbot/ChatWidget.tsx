"use client";

import { useState, FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import { MessageCircle } from "lucide-react";

type Message = {
  role: "user" | "bot";
  text: string;
  timestamp: string;
};

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! I'm Finbot's AI assistant. How can I help you?",
      timestamp: formatTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const now = formatTime();

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed, timestamp: now },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      const botText =
        data.reply || "Sorry, I couldn't generate a response. Please try again.";

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: botText, timestamp: formatTime() },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Error connecting to Finbot AI. Please try again.",
          timestamp: formatTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition transform hover:scale-105 z-40"
        aria-label="Open Finbot chat"
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col animate-slide-up z-40">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Finbot AI Assistant</h2>
              <p className="text-[11px] text-gray-500">
                Ask anything about investing, savings, or your money.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-end gap-2 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Bot avatar */}
                {m.role === "bot" && (
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                    AI
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`px-3 py-2 rounded-lg max-w-[80%] text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-800 dark:text-white"
                  }`}
                >
                  {m.role === "user" ? (
                    <p>{m.text}</p>
                  ) : (
                    <div className="prose prose-xs max-w-none dark:prose-invert">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  )}
                  <div
                    className={`mt-1 text-[10px] opacity-70 ${
                      m.role === "user" ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {/* User avatar */}
                {m.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white flex items-center justify-center text-xs font-semibold">
                    U
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
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
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2"
          >
            <input
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-xs dark:bg-gray-800 dark:text-white"
              placeholder="Ask Finbot something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
