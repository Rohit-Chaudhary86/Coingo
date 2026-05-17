import { useState, useEffect } from "react";

function SentimentBadge({ coin }) {
  const [sentiment, setSentiment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyzeSentiment();
  }, [coin.id]);

  async function analyzeSentiment() {
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
            max_tokens: 10,
            messages: [
              {
                role: "user",
                content: `Based on this data for ${coin.name}:
- 24h price change: ${coin.price_change_percentage_24h?.toFixed(2)}%
- Current price: $${coin.current_price}
- Market cap rank: #${coin.market_cap_rank}

Reply with ONLY one word: Bullish, Bearish, or Neutral.`,
              },
            ],
          }),
        }
      );
      const data = await response.json();
      const result = data.choices[0].message.content.trim();
      if (result.includes("Bullish")) setSentiment("Bullish");
      else if (result.includes("Bearish")) setSentiment("Bearish");
      else setSentiment("Neutral");
    } catch {
      setSentiment("Neutral");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 animate-pulse">
        ···
      </span>
    );
  }

  const styles = {
    Bullish: "bg-green-400/10 text-green-400 border border-green-400/30",
    Bearish: "bg-red-400/10 text-red-400 border border-red-400/30",
    Neutral: "bg-gray-400/10 text-gray-400 border border-gray-400/30",
  };

  const icons = { Bullish: "▲", Bearish: "▼", Neutral: "●" };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${styles[sentiment]}`}>
      {icons[sentiment]} {sentiment}
    </span>
  );
}

export default SentimentBadge;