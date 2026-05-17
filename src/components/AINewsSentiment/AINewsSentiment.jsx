import { useState, useEffect } from "react";

function AINewsSentiment({ coinName, coinSymbol }) {
  const [sentiment, setSentiment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (coinName) analyze();
  }, [coinName]);

  async function analyze() {
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
            max_tokens: 300,
            messages: [
              {
                role: "system",
                content: `You are a crypto news sentiment analyst. Respond ONLY with valid JSON. No markdown.`,
              },
              {
                role: "user",
                content: `Based on your knowledge of ${coinName} (${coinSymbol?.toUpperCase()}) and recent crypto market trends, provide a sentiment analysis as JSON:
{
  "sentiment": "Bullish" | "Bearish" | "Neutral",
  "score": number between 1-10 (10 = most bullish),
  "headline": "one fake but realistic news headline that captures current sentiment",
  "summary": "2 sentences on current market narrative around this coin",
  "keyFactor": "the single biggest factor affecting sentiment right now"
}

Return only valid JSON.`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const text = data.choices[0].message.content.trim();
      const clean = text.replace(/```json|```/g, "").trim();
      setSentiment(JSON.parse(clean));
    } catch {
      setSentiment(null);
    } finally {
      setIsLoading(false);
    }
  }

  const colors = {
    Bullish: "text-green-400 border-green-400/30 bg-green-400/10",
    Bearish: "text-red-400 border-red-400/30 bg-red-400/10",
    Neutral: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-yellow-400 rounded-lg flex items-center justify-center text-black text-xs font-bold">AI</div>
        <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">
          AI Market Sentiment
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="loading loading-dots loading-xs"></span>
          Reading market sentiment...
        </div>
      ) : sentiment ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold px-3 py-1 rounded-full border ${colors[sentiment.sentiment]}`}>
              {sentiment.sentiment}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-4 rounded-sm ${
                    i < sentiment.score
                      ? sentiment.sentiment === "Bullish" ? "bg-green-400"
                        : sentiment.sentiment === "Bearish" ? "bg-red-400"
                        : "bg-yellow-400"
                      : "bg-gray-700"
                  }`}
                />
              ))}
              <span className="text-gray-400 text-xs ml-1">{sentiment.score}/10</span>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl px-4 py-3">
            <div className="text-gray-500 text-xs mb-1">Market Narrative</div>
            <p className="text-white text-sm font-medium">"{sentiment.headline}"</p>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed">{sentiment.summary}</p>

          <div className="bg-gray-900 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <span className="text-gray-400 text-xs">Key Factor</span>
            <span className="text-yellow-400 text-xs font-semibold">{sentiment.keyFactor}</span>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-sm">Could not load sentiment data.</p>
      )}
    </div>
  );
}

export default AINewsSentiment;