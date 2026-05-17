import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SUGGESTED = [
  "What is the difference between Bitcoin and Ethereum?",
  "Is crypto a good investment in 2025?",
  "What is DeFi and how does it work?",
  "What are the biggest risks in crypto?",
  "Explain blockchain in simple terms",
  "What is a bull run and bear market?",
];

function AskAIPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey! I'm your crypto AI assistant. Ask me anything about crypto — concepts, coins, market trends, how things work. I'll keep it simple and honest.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text) {
    const msg = text || input;
    if (!msg.trim() || isLoading) return;

    const userMsg = { role: "user", content: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            max_tokens: 512,
            messages: [
              {
                role: "system",
                content: `You are a friendly crypto educator. Answer questions about cryptocurrency, blockchain, DeFi, NFTs, and market concepts clearly and concisely. Keep answers under 4 sentences unless a detailed explanation is needed. Be honest about uncertainty. Never give specific financial advice. Sound like a knowledgeable friend, not a textbook.`,
              },
              ...updated.slice(1).map((m) => ({ role: m.role, content: m.content })),
            ],
          }),
        }
      );

      const data = await response.json();
      setMessages([...updated, {
        role: "assistant",
        content: data.choices[0].message.content,
      }]);
    } catch {
      setMessages([...updated, {
        role: "assistant",
        content: "Something went wrong. Please try again!",
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col" style={{ height: "calc(100vh - 80px)" }}>
      <button onClick={() => navigate("/")} className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-2">
        ← Back to market
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-bold">AI</div>
        <div>
          <h1 className="text-2xl font-bold text-white">Ask AI Anything</h1>
          <p className="text-gray-400 text-sm">Your crypto knowledge assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col gap-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 bg-yellow-400 rounded-lg flex items-center justify-center text-black text-xs font-bold mr-2 mt-1 flex-shrink-0">
                AI
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-yellow-400 text-black rounded-br-none font-medium"
                : "bg-gray-700 text-gray-100 rounded-bl-none"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-yellow-400 rounded-lg flex items-center justify-center text-black text-xs font-bold flex-shrink-0">AI</div>
            <div className="bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-none">
              <span className="loading loading-dots loading-sm text-yellow-400"></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTED.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="text-xs border border-gray-600 rounded-full px-3 py-1.5 text-gray-300 hover:border-yellow-400 hover:text-yellow-400 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask anything about crypto..."
          className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
          disabled={isLoading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={isLoading || !input.trim()}
          className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black font-bold px-5 rounded-xl transition-all"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default AskAIPage;