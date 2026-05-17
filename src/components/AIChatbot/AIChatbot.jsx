import { useState, useRef, useEffect } from "react";

function AIChatbot({ coin, currency }) {
  const symbol = currency === 'inr' ? '₹' : '$';
  const price = coin?.market_data?.current_price?.[currency];
  const priceChange = coin?.market_data?.price_change_percentage_24h?.toFixed(2);
  const marketCap = coin?.market_data?.market_cap?.[currency]?.toLocaleString();
  const isPositive = priceChange >= 0;

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hey! I'm your AI analyst for ${coin?.name}. I have access to its live price (${symbol}${price?.toLocaleString()}), market cap, and recent performance. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 const coinContext = `You are a sharp, friendly crypto analyst. You give SHORT, conversational answers — like a knowledgeable friend texting you, not a financial advisor writing a report.

Live data for ${coin?.name} (${coin?.symbol?.toUpperCase()}):
- Price: ${symbol}${price?.toLocaleString()}
- 24h Change: ${priceChange}% (${isPositive ? 'up' : 'down'} today)
- Market Cap: ${symbol}${marketCap}
- Rank: #${coin?.market_cap_rank}
- About: ${coin?.description?.en?.slice(0, 400)}

Rules you MUST follow:
1. Keep answers under 4 sentences. Be direct.
2. No bullet points unless the user asks for a list.
3. Mention "not financial advice" only once, naturally, not at the end of every reply.
4. Sound human — casual, confident, honest.
5. If the answer is simple, keep it simple. Don't over-explain.`;

  const suggestions = [
    "Is this a good time to buy?",
    "What's driving the price today?",
    "How risky is this coin?",
    "Explain this coin in simple terms",
  ];

  async function sendMessage(text) {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage = { role: "user", content: messageText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
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
            max_tokens: 1024,
            messages: [
              { role: "system", content: coinContext },
              ...updatedMessages.slice(1).map((m) => ({
                role: m.role,
                content: m.content,
              })),
            ],
          }),
        }
      );

      const data = await response.json();
      setMessages([...updatedMessages, {
        role: "assistant",
        content: data.choices[0].message.content,
      }]);
    } catch (error) {
      setMessages([...updatedMessages, {
        role: "assistant",
        content: "Sorry, something went wrong on my end. Try again in a moment!",
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden flex flex-col h-[600px]">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-bold text-sm">
            AI
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Coin Analyst</div>
            <div className="text-gray-400 text-xs">Powered by Llama 3.3 · {coin?.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-400">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          Online
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 bg-yellow-400 rounded-lg flex items-center justify-center text-black text-xs font-bold mr-2 mt-1 flex-shrink-0">
                AI
              </div>
            )}
            <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-yellow-400 text-black rounded-br-none font-medium"
                : "bg-gray-700/80 text-gray-100 rounded-bl-none"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-7 h-7 bg-yellow-400 rounded-lg flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
              AI
            </div>
            <div className="bg-gray-700/80 px-4 py-3 rounded-2xl rounded-bl-none">
              <span className="loading loading-dots loading-sm text-yellow-400"></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {suggestions.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="text-xs border border-gray-600 rounded-full px-3 py-1.5 text-gray-300 hover:border-yellow-400 hover:text-yellow-400 hover:bg-yellow-400/5 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder={`Ask anything about ${coin?.name}...`}
          className="flex-1 bg-gray-900 border border-gray-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
          disabled={isLoading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={isLoading || !input.trim()}
          className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black font-bold px-4 py-2.5 rounded-xl transition-all text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default AIChatbot;