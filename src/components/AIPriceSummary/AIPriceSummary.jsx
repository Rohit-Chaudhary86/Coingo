import { useState, useEffect } from "react";

function AIPriceSummary({ coinName, coinSymbol, days, currency, historicData }) {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const symbol = currency === "inr" ? "₹" : "$";

  useEffect(() => {
    if (!historicData?.prices?.length) return;
    generateSummary();
  }, [coinName, days, currency, historicData]);

  async function generateSummary() {
    setIsLoading(true);
    setSummary("");

    const prices = historicData.prices;
    const firstPrice = prices[0][1];
    const lastPrice = prices[prices.length - 1][1];
    const highPrice = Math.max(...prices.map((p) => p[1]));
    const lowPrice = Math.min(...prices.map((p) => p[1]));
    const percentChange = (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2);
    const isUp = percentChange >= 0;

    const prompt = `You are a crypto analyst giving a VERY short price trend summary — 2 sentences max, like a Bloomberg headline. Be direct and specific.

Data for ${coinName} (${coinSymbol?.toUpperCase()}) over the past ${days} day${days == 1 ? "" : "s"}:
- Starting price: ${symbol}${firstPrice?.toLocaleString()}
- Current price: ${symbol}${lastPrice?.toLocaleString()}
- Change: ${percentChange}% (${isUp ? "up" : "down"})
- Period high: ${symbol}${highPrice?.toLocaleString()}
- Period low: ${symbol}${lowPrice?.toLocaleString()}

Write a 2-sentence human summary of this price action. First sentence: what happened. Second sentence: one possible reason why. No disclaimers. No bullet points.`;

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
            max_tokens: 150,
            messages: [{ role: "user", content: prompt }],
          }),
        }
      );

      const data = await response.json();
      setSummary(data.choices[0].message.content);
    } catch (err) {
      setSummary("Couldn't load AI summary right now.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-6 mb-4 bg-gray-900/80 border border-yellow-400/20 rounded-xl px-5 py-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-yellow-400 rounded-md flex items-center justify-center text-black text-xs font-bold">
          AI
        </div>
        <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">
          AI Trend Analysis · {days} day{days == 1 ? "" : "s"}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="loading loading-dots loading-xs"></span>
          Analyzing price movement...
        </div>
      ) : (
        <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>
      )}
    </div>
  );
}

export default AIPriceSummary;