"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

type Message = {
  role: "user" | "bot";
  text: string;
};

const STORAGE_KEY = "finbot_chat_history_v1";

// 🔍 Dynamic suggestion generator (super smart based on last user msg)
function getSuggestions(messages: Message[]): string[] {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  if (!lastUser) {
    // Default suggestions when no user message yet
    return [
      "Should I invest now?",
      "Explain SIP vs Lump Sum",
      "Analyze my stock",
      "Build a beginner portfolio",
    ];
  }

  const text = lastUser.text.toLowerCase();
  const suggestions: string[] = [];
  const add = (s: string) => {
    if (!suggestions.includes(s)) suggestions.push(s);
  };

  // Beginner / starting out
  if (
    text.includes("beginner") ||
    text.includes("new") ||
    text.includes("start") ||
    text.includes("first time")
  ) {
    add("How should a beginner start investing?");
    add("Build a beginner portfolio");
    add("Explain SIP vs Lump Sum");
  }

  // SIP / mutual funds
  if (
    text.includes("sip") ||
    text.includes("lump") ||
    text.includes("mutual fund") ||
    text.includes("mf")
  ) {
    add("Explain SIP vs Lump Sum");
    add("Are mutual funds good for me?");
  }

  // Stocks / markets
  const stockKeywords = ["stock", "share", "nifty", "sensex", "index", "market"];
  if (stockKeywords.some((k) => text.includes(k))) {
    add("Analyze my stock");
    add("Is it a good time to buy this stock?");
    add("What risks should I consider before buying this stock?");
  }

  // Savings / emergency fund
  const savingKeywords = ["save", "saving", "fd", "rd", "bank", "emergency", "cash"];
  if (savingKeywords.some((k) => text.includes(k))) {
    add("Should I invest or keep money in savings?");
    add("How much emergency fund should I keep?");
  }

  // If nothing matched, fallback to defaults
  if (suggestions.length === 0) {
    return [
      "Should I invest now?",
      "Explain SIP vs Lump Sum",
      "Analyze my stock",
      "Build a beginner portfolio",
    ];
  }

  return suggestions.slice(0, 4);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi, I'm Finbot — your AI assistant. Ask me anything about investing, savings, or your portfolio.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Typing animation state
  const [pendingBotText, setPendingBotText] = useState<string | null>(null);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isThinking = loading || pendingBotText !== null;

  // 🧠 Load history from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (err) {
        console.error("Failed to parse saved chat history", err);
      }
    }
  }, []);

  // 💾 Save history whenever messages change
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // 🔽 Auto-scroll to bottom when messages or thinking state change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // ✨ Typing animation for bot replies (fast but slightly slower than before)
  useEffect(() => {
    if (pendingBotText == null || animatingIndex == null) return;

    const text = pendingBotText;
    let i = 0;
    const step = 3; // characters per tick
    const intervalSpeed = 12; // ms between ticks

    const interval = setInterval(() => {
      i += step;

      setMessages((prev) => {
        if (!prev[animatingIndex]) return prev;
        const updated = [...prev];
        updated[animatingIndex] = {
          ...updated[animatingIndex],
          text: text.slice(0, i),
        };
        return updated;
      });

      if (i >= text.length) {
        clearInterval(interval);
        setPendingBotText(null);
        setAnimatingIndex(null);
      }
    }, intervalSpeed);

    return () => clearInterval(interval);
  }, [pendingBotText, animatingIndex]);

  // Core send function (used by form + suggestion chips)
  async function sendMessageText(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (isThinking) return; // prevent spamming while bot is thinking

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setLoading(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();
      const botText =
        data.reply ??
        "Sorry, I couldn't generate a response. Please try again.";

      // Add an empty bot message, then animate it
      setMessages((prev) => {
        const newMessages = [...prev, { role: "bot", text: "" }];
        const index = newMessages.length - 1;
        setAnimatingIndex(index);
        setPendingBotText(botText);
        return newMessages;
      });
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Error talking to Finbot AI. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const currentInput = input;
    setInput("");
    await sendMessageText(currentInput);
  }

  function handleSuggestionClick(text: string) {
    sendMessageText(text);
  }

  const suggestions = getSuggestions(messages);

  return (
    <main className="min-h-screen bg-[#02040a]">
      {/* ⭐ Sticky Top Glass Navbar */}
      <div
        className="sticky top-0 z-30 max-w-5xl mx-auto mb-6 flex items-center justify-between 
          backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-6 py-4 shadow-lg mt-4"
      >
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

      {/* ⭐ Chat Container */}
      <div className="w-full flex items-center justify-center">
        <div
          className="w-full max-w-3xl rounded-2xl bg-[#0b0f1a] border border-gray-800 shadow-2xl 
                        flex flex-col overflow-hidden mb-10"
        >
          {/* Chat Title */}
          <header className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center 
                              text-sm font-semibold text-white"
              >
                AI
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Finbot AI Chat</h1>
                <p className="text-xs text-gray-400">
                  Ask questions about stocks, saving vs investing, market risk, and more.
                </p>
              </div>
            </div>
          </header>

          {/* ⭐ Messages Area */}
          <section className="flex-1 px-6 py-4 space-y-4 overflow-y-auto max-h-[65vh] chat-scroll">
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

            {/* Typing Indicator */}
            {isThinking && (
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

            {/* Auto scroll anchor */}
            <div ref={messagesEndRef} />
          </section>

          {/* ⭐ Dynamic Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-6 pb-3 pt-2 border-t border-gray-800 bg-[#050814] flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="text-xs sm:text-[13px] px-3 py-1.5 rounded-full bg-[#111827] text-gray-200 
                             border border-gray-700 hover:border-blue-500 hover:text-white 
                             hover:bg-[#1f2937] transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* ⭐ Input Box */}
          <form
            onSubmit={handleSubmit}
            className="px-6 py-4 flex gap-3 bg-[#050814]"
          >
            <input
              className="flex-1 rounded-full bg-[#050814] border border-gray-700 px-4 py-2.5
                         text-sm text-white placeholder:text-gray-500 focus:outline-none
                         focus:border-blue-500"
              placeholder="Ask Finbot something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isThinking}
            />
            <button
              type="submit"
              disabled={isThinking}
              className="px-5 py-2.5 rounded-full bg-blue-600 text-sm font-medium 
                         text-white hover:bg-blue-500 disabled:opacity-60 transition"
            >
              {isThinking ? "Answering..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
