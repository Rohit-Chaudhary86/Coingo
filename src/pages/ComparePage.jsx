import { useState } from "react";
import { useQuery } from "react-query";
import { fetchCoinData } from "../Services/fetchCoinData";
import currencyStore from "../state/store";
import { useNavigate } from "react-router-dom";
import PageLoader from "../components/PageLoader/PageLoader";

function ComparePage() {
  const { currency } = currencyStore();
  const navigate = useNavigate();
  const symbol = currency === "inr" ? "₹" : "$";
  const [coin1, setCoin1] = useState("");
  const [coin2, setCoin2] = useState("");
  const [comparison, setComparison] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const { data: coins, isLoading } = useQuery(
    ["coins", 1, currency],
    () => fetchCoinData(1, currency),
    { cacheTime: 1000 * 60 * 5, staleTime: 1000 * 60 * 5 }
  );

  const { data: coins2Data } = useQuery(
    ["coins", 2, currency],
    () => fetchCoinData(2, currency),
    { cacheTime: 1000 * 60 * 5, staleTime: 1000 * 60 * 5 }
  );

  const allCoins = [...(coins || []), ...(coins2Data || [])];

  async function handleCompare() {
    if (!coin1 || !coin2) { setError("Please select both coins."); return; }
    if (coin1 === coin2) { setError("Please select two different coins."); return; }
    setError("");
    setIsAnalyzing(true);
    setComparison(null);

    const c1 = allCoins.find((c) => c.id === coin1);
    const c2 = allCoins.find((c) => c.id === coin2);

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
            max_tokens: 1000,
            messages: [
              {
                role: "system",
                content: `You are a crypto analyst. Respond ONLY with valid JSON. No markdown.`,
              },
              {
                role: "user",
                content: `Compare these two coins and return JSON with this EXACT structure:
{
  "winner": "name of overall better coin right now",
  "winnerReason": "1 sentence why",
  "metrics": {
    "pricePerformance": { "winner": "coin name", "reason": "1 sentence" },
    "riskLevel": { "winner": "coin name", "reason": "1 sentence" },
    "marketPosition": { "winner": "coin name", "reason": "1 sentence" },
    "longTerm": { "winner": "coin name", "reason": "1 sentence" },
    "shortTerm": { "winner": "coin name", "reason": "1 sentence" }
  },
  "coin1Summary": "2 sentence honest summary of ${c1?.name}",
  "coin2Summary": "2 sentence honest summary of ${c2?.name}",
  "verdict": "3 sentence final verdict on which to choose and why"
}

Coin 1 — ${c1?.name} (${c1?.symbol?.toUpperCase()}):
- Price: ${symbol}${c1?.current_price?.toLocaleString()}
- 24h Change: ${c1?.price_change_percentage_24h?.toFixed(2)}%
- Market Cap: ${symbol}${(c1?.market_cap / 1e9).toFixed(2)}B
- Rank: #${c1?.market_cap_rank}

Coin 2 — ${c2?.name} (${c2?.symbol?.toUpperCase()}):
- Price: ${symbol}${c2?.current_price?.toLocaleString()}
- 24h Change: ${c2?.price_change_percentage_24h?.toFixed(2)}%
- Market Cap: ${symbol}${(c2?.market_cap / 1e9).toFixed(2)}B
- Rank: #${c2?.market_cap_rank}`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const text = data.choices[0].message.content.trim();
      const clean = text.replace(/```json|```/g, "").trim();
      setComparison({ ...JSON.parse(clean), c1, c2 });
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  if (isLoading) return <PageLoader />;

  const metrics = [
    { key: "pricePerformance", label: "Price Performance", icon: "📈" },
    { key: "riskLevel", label: "Risk Level", icon: "⚡" },
    { key: "marketPosition", label: "Market Position", icon: "🏆" },
    { key: "longTerm", label: "Long Term", icon: "📅" },
    { key: "shortTerm", label: "Short Term", icon: "⚡" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate("/")} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2">
        ← Back to market
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-bold">AI</div>
        <div>
          <h1 className="text-3xl font-bold text-white">Coin Comparison</h1>
          <p className="text-gray-400 text-sm">AI-powered side-by-side analysis of any two coins</p>
        </div>
      </div>

      {/* Selector */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">First Coin</label>
            <select
              value={coin1}
              onChange={(e) => setCoin1(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400"
            >
              <option value="">Select a coin...</option>
              {allCoins.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.symbol?.toUpperCase()})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Second Coin</label>
            <select
              value={coin2}
              onChange={(e) => setCoin2(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400"
            >
              <option value="">Select a coin...</option>
              {allCoins.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.symbol?.toUpperCase()})</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={handleCompare}
          disabled={isAnalyzing}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="loading loading-spinner loading-sm"></span>
              AI is comparing...
            </span>
          ) : "Compare with AI"}
        </button>
      </div>

      {/* Results */}
      {comparison && (
        <div className="flex flex-col gap-5">

          {/* Winner banner */}
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-5 text-center">
            <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-2">AI Recommendation</div>
            <div className="text-white text-2xl font-bold mb-1">{comparison.winner} wins</div>
            <p className="text-gray-300 text-sm">{comparison.winnerReason}</p>
          </div>

          {/* Coin summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <img src={comparison.c1?.image} className="w-8 h-8 rounded-full" alt={comparison.c1?.name} />
                <div>
                  <div className="text-white font-bold">{comparison.c1?.name}</div>
                  <div className="text-gray-400 text-xs">{symbol}{comparison.c1?.current_price?.toLocaleString()}</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{comparison.coin1Summary}</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <img src={comparison.c2?.image} className="w-8 h-8 rounded-full" alt={comparison.c2?.name} />
                <div>
                  <div className="text-white font-bold">{comparison.c2?.name}</div>
                  <div className="text-gray-400 text-xs">{symbol}{comparison.c2?.current_price?.toLocaleString()}</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{comparison.coin2Summary}</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
            <div className="text-xs text-yellow-400 font-semibold uppercase tracking-wider mb-4">Head to Head</div>
            <div className="flex flex-col gap-3">
              {metrics.map((metric) => {
                const result = comparison.metrics?.[metric.key];
                const c1Wins = result?.winner === comparison.c1?.name;
                return (
                  <div key={metric.key} className="grid grid-cols-7 items-center gap-2 py-2 border-b border-gray-700 last:border-0">
                    <div className={`col-span-3 text-right text-sm font-semibold ${c1Wins ? "text-yellow-400" : "text-gray-400"}`}>
                      {c1Wins ? "✓ " : ""}{comparison.c1?.name}
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded-lg">{metric.icon} {metric.label}</span>
                    </div>
                    <div className={`col-span-3 text-left text-sm font-semibold ${!c1Wins ? "text-yellow-400" : "text-gray-400"}`}>
                      {!c1Wins ? "✓ " : ""}{comparison.c2?.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verdict */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">📋 Final Verdict</div>
            <p className="text-gray-300 text-sm leading-relaxed">{comparison.verdict}</p>
          </div>

          <p className="text-center text-gray-500 text-xs">AI analysis only. Not financial advice.</p>
        </div>
      )}
    </div>
  );
}

export default ComparePage;