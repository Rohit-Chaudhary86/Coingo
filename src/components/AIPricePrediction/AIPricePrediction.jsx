import { useState, useEffect } from "react";

function AIPricePrediction({ coinName, coinSymbol, currency, historicData }) {
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const symbol = currency === "inr" ? "₹" : "$";

  useEffect(() => {
    if (historicData?.prices?.length) generatePrediction();
  }, [coinName, historicData]);

  async function generatePrediction() {
    setIsLoading(true);
    const prices = historicData.prices;
    const last7Days = prices.slice(-7).map((p) => ({
      date: new Date(p[0]).toLocaleDateString(),
      price: p[1].toFixed(2),
    }));

    const first = prices[0][1];
    const last = prices[prices.length - 1][1];
    const change = (((last - first) / first) * 100).toFixed(2);
    const high = Math.max(...prices.map((p) => p[1])).toFixed(2);
    const low = Math.min(...prices.map((p) => p[1])).toFixed(2);

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
                content: `You are a crypto technical analyst. Respond ONLY with valid JSON. No markdown.`,
              },
              {
                role: "user",
                content: `Analyze this 7-day price data for ${coinName} (${coinSymbol?.toUpperCase()}) and return JSON:
{
  "outlook": "Bullish" | "Bearish" | "Neutral",
  "timeframe": "24-48 hours",
  "prediction": "2 sentence short-term price outlook based on the trend",
  "keyLevel": "${symbol}X — one key support or resistance level to watch",
  "confidence": "Low" | "Medium" | "High"
}

Price data: ${JSON.stringify(last7Days)}
7-day change: ${change}%
Period high: ${symbol}${high}
Period low: ${symbol}${low}

No markdown. Return only the JSON object.`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const text = data.choices[0].message.content.trim();
      const clean = text.replace(/```json|```/g, "").trim();
      setPrediction(JSON.parse(clean));
    } catch {
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  }

  const outlookColors = {
    Bullish: "text-green-400 bg-green-400/10 border-green-400/30",
    Bearish: "text-red-400 bg-red-400/10 border-red-400/30",
    Neutral: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  };

  const confidenceColors = {
    High: "text-green-400",
    Medium: "text-yellow-400",
    Low: "text-red-400",
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 mx-0">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-yellow-400 rounded-lg flex items-center justify-center text-black text-xs font-bold">
          AI
        </div>
        <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">
          AI Price Prediction · 7-day data
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="loading loading-dots loading-xs"></span>
          Analyzing price momentum...
        </div>
      ) : prediction ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold px-3 py-1 rounded-full border ${outlookColors[prediction.outlook]}`}>
              {prediction.outlook} Outlook
            </span>
            <span className="text-gray-400 text-xs">
              Confidence:{" "}
              <span className={`font-semibold ${confidenceColors[prediction.confidence]}`}>
                {prediction.confidence}
              </span>
            </span>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed">
            {prediction.prediction}
          </p>

          <div className="bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-gray-400 text-xs">Key Level to Watch</span>
            <span className="text-yellow-400 font-semibold text-sm">
              {prediction.keyLevel}
            </span>
          </div>

          <p className="text-gray-500 text-xs">
            ⚠ AI prediction only. Not financial advice. Crypto is highly volatile.
          </p>
        </div>
      ) : (
        <p className="text-gray-400 text-sm">Could not generate prediction.</p>
      )}
    </div>
  );
}

export default AIPricePrediction;