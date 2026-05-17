import { useState } from "react";
import { useQuery } from "react-query";
import { fetchCoinData } from "../Services/fetchCoinData";
import currencyStore from "../state/store";
import { useNavigate } from "react-router-dom";
import PageLoader from "../components/PageLoader/PageLoader";

function InsightsPage() {
  const { currency } = currencyStore();
  const navigate = useNavigate();
  const symbol = currency === "inr" ? "₹" : "$";
  const [insights, setInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generated, setGenerated] = useState(false);

  const { data: coins1, isLoading: loading1 } = useQuery(
    ["coins", 1, currency],
    () => fetchCoinData(1, currency),
    { cacheTime: 1000 * 60 * 5, staleTime: 1000 * 60 * 5 },
  );
  const { data: coins2, isLoading: loading2 } = useQuery(
    ["coins", 2, currency],
    () => fetchCoinData(2, currency),
    { cacheTime: 1000 * 60 * 5, staleTime: 1000 * 60 * 5 },
  );
  const { data: coins3, isLoading: loading3 } = useQuery(
    ["coins", 3, currency],
    () => fetchCoinData(3, currency),
    { cacheTime: 1000 * 60 * 5, staleTime: 1000 * 60 * 5 },
  );
  const { data: coins4, isLoading: loading4 } = useQuery(
    ["coins", 4, currency],
    () => fetchCoinData(4, currency),
    { cacheTime: 1000 * 60 * 5, staleTime: 1000 * 60 * 5 },
  );
  const { data: coins5, isLoading: loading5 } = useQuery(
    ["coins", 5, currency],
    () => fetchCoinData(5, currency),
    { cacheTime: 1000 * 60 * 5, staleTime: 1000 * 60 * 5 },
  );

  const isLoading = loading1 || loading2 || loading3 || loading4 || loading5;
  const coins = [
    ...(coins1 || []),
    ...(coins2 || []),
    ...(coins3 || []),
    ...(coins4 || []),
    ...(coins5 || []),
  ];

  async function generateInsights() {
    if (!coins?.length) return;
    setIsAnalyzing(true);
    setInsights(null);
    setGenerated(false);

    const coinSummary = coins.slice(0, 50).map((c) => ({
      name: c.name,
      symbol: c.symbol?.toUpperCase(),
      price: `${symbol}${c.current_price?.toLocaleString()}`,
      change24h: `${c.price_change_percentage_24h?.toFixed(2)}%`,
      marketCap: `${symbol}${(c.market_cap / 1e9).toFixed(2)}B`,
      rank: c.market_cap_rank,
      volume: `${symbol}${(c.total_volume / 1e9).toFixed(2)}B`,
    }));

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
            max_tokens: 2000,
            messages: [
              {
                role: "system",
                content: `You are a professional crypto market analyst writing a daily briefing. Respond ONLY with a valid JSON object. No markdown, no explanation outside the JSON.`,
              },
              {
                role: "user",
                content: `Analyze these top 50 coins and return a JSON object with this EXACT structure:
{
  "marketMood": "Bullish" | "Bearish" | "Mixed",
  "moodReason": "2 sentences explaining overall market mood based on the data",
  "marketStats": {
    "gainers": "how many coins are up today (count)",
    "losers": "how many coins are down today (count)",
    "avgChange": "average 24h change across all 50 coins",
    "dominance": "which coin seems to be leading the market today"
  },
  "topPick": { 
    "name": "coin name", 
    "symbol": "SYMBOL", 
    "reason": "3 sentences why this is the top pick today" 
  },
  "avoidPick": { 
    "name": "coin name", 
    "symbol": "SYMBOL", 
    "reason": "3 sentences why to be cautious with this coin" 
  },
  "topGainers": [
    { "name": "coin", "symbol": "SYM", "change": "x%" },
    { "name": "coin", "symbol": "SYM", "change": "x%" },
    { "name": "coin", "symbol": "SYM", "change": "x%" }
  ],
  "topLosers": [
    { "name": "coin", "symbol": "SYM", "change": "x%" },
    { "name": "coin", "symbol": "SYM", "change": "x%" },
    { "name": "coin", "symbol": "SYM", "change": "x%" }
  ],
  "watchList": [
    { "name": "coin", "symbol": "SYM", "insight": "2 sentence insight on why to watch" },
    { "name": "coin", "symbol": "SYM", "insight": "2 sentence insight on why to watch" },
    { "name": "coin", "symbol": "SYM", "insight": "2 sentence insight on why to watch" },
    { "name": "coin", "symbol": "SYM", "insight": "2 sentence insight on why to watch" },
    { "name": "coin", "symbol": "SYM", "insight": "2 sentence insight on why to watch" }
  ],
  "sectorAnalysis": {
    "defi": "2 sentence analysis of DeFi coins in the list",
    "layer1": "2 sentence analysis of Layer 1 blockchains",
    "altcoins": "2 sentence analysis of altcoins outside top 10"
  },
  "riskMeter": "Low" | "Medium" | "High",
  "riskReason": "2 sentences explaining overall market risk level",
  "summary": "4 sentence comprehensive market summary covering mood, opportunities, risks, and outlook"
}

Coin data: ${JSON.stringify(coinSummary)}`,
              },
            ],
          }),
        },
      );

      const data = await response.json();
      const text = data.choices[0].message.content.trim();
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setInsights(parsed);
      setGenerated(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  }

  if (isLoading) return <PageLoader />;

  const moodColors = {
    Bullish: "text-green-400 border-green-400/30 bg-green-400/10",
    Bearish: "text-red-400 border-red-400/30 bg-red-400/10",
    Mixed: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-2"
        >
          ← Back to market
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-bold">
            AI
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Market Insights</h1>
            <p className="text-gray-400 text-sm">
              AI-generated daily briefing on the top 50 coins
            </p>
          </div>
        </div>
      </div>

      {/* Generate button */}
      {!generated && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4"> </div>
          <h2 className="text-white text-xl font-bold mb-2">
            Ready to analyze the market
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            Click below and the AI will analyze the top 50 coins and give you a
            full market briefing — mood, top pick, what to avoid, and more.
          </p>
          <button
            onClick={generateInsights}
            disabled={isAnalyzing}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                Analyzing top 50 coins...
              </span>
            ) : (
              "Generate Today's Insights"
            )}
          </button>
        </div>
      )}

      {/* Insights */}
      {insights && (
        <div className="flex flex-col gap-5">
          {/* Market mood */}
          <div
            className={`border rounded-2xl p-5 ${moodColors[insights.marketMood]}`}
          >
            <div className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">
              Overall Market Mood
            </div>
            <div className="text-3xl font-bold mb-1">{insights.marketMood}</div>
            <div className="text-sm opacity-80">{insights.moodReason}</div>
          </div>

          {/* Market stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Coins Up",
                value: insights.marketStats?.gainers,
                color: "text-green-400",
              },
              {
                label: "Coins Down",
                value: insights.marketStats?.losers,
                color: "text-red-400",
              },
              {
                label: "Avg 24h Change",
                value: insights.marketStats?.avgChange,
                color: "text-yellow-400",
              },
              {
                label: "Market Leader",
                value: insights.marketStats?.dominance,
                color: "text-white",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center"
              >
                <div className="text-gray-400 text-xs mb-1">{stat.label}</div>
                <div className={`font-bold text-lg ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Risk meter */}
          <div
            className={`border rounded-2xl p-5 ${
              insights.riskMeter === "High"
                ? "bg-red-400/10 border-red-400/30"
                : insights.riskMeter === "Medium"
                  ? "bg-yellow-400/10 border-yellow-400/30"
                  : "bg-green-400/10 border-green-400/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Risk Meter
              </div>
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${
                  insights.riskMeter === "High"
                    ? "bg-red-400/20 text-red-400"
                    : insights.riskMeter === "Medium"
                      ? "bg-yellow-400/20 text-yellow-400"
                      : "bg-green-400/20 text-green-400"
                }`}
              >
                {insights.riskMeter} Risk
              </span>
            </div>
            <p className="text-gray-300 text-sm">{insights.riskReason}</p>
          </div>

          {/* Top pick + Avoid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-400/10 border border-green-400/30 rounded-2xl p-5">
              <div className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-3">
                ✦ Top Pick Today
              </div>
              <div className="text-white font-bold text-xl mb-2">
                {insights.topPick?.name}
                <span className="text-gray-400 text-sm font-normal ml-2">
                  {insights.topPick?.symbol}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {insights.topPick?.reason}
              </p>
            </div>
            <div className="bg-red-400/10 border border-red-400/30 rounded-2xl p-5">
              <div className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-3">
                ⚠ Use Caution
              </div>
              <div className="text-white font-bold text-xl mb-2">
                {insights.avoidPick?.name}
                <span className="text-gray-400 text-sm font-normal ml-2">
                  {insights.avoidPick?.symbol}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {insights.avoidPick?.reason}
              </p>
            </div>
          </div>

          {/* Top gainers + losers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
              <div className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-4">
                🚀 Top Gainers
              </div>
              {insights.topGainers?.map((coin, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
                >
                  <div>
                    <span className="text-white font-semibold text-sm">
                      {coin.name}{" "}
                    </span>
                    <span className="text-gray-500 text-xs">{coin.symbol}</span>
                  </div>
                  <span className="text-green-400 font-bold text-sm">
                    ▲ {coin.change}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
              <div className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-4">
                📉 Top Losers
              </div>
              {insights.topLosers?.map((coin, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
                >
                  <div>
                    <span className="text-white font-semibold text-sm">
                      {coin.name}{" "}
                    </span>
                    <span className="text-gray-500 text-xs">{coin.symbol}</span>
                  </div>
                  <span className="text-red-400 font-bold text-sm">
                    ▼ {coin.change}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Watchlist */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
            <div className="text-xs text-yellow-400 font-semibold uppercase tracking-wider mb-4">
              👁 Watchlist — 5 Coins to Watch
            </div>
            <div className="flex flex-col gap-3">
              {insights.watchList?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 pb-3 border-b border-gray-700 last:border-0 last:pb-0"
                >
                  <div className="w-7 h-7 bg-gray-700 rounded-lg flex items-center justify-center text-yellow-400 text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <span className="text-white font-semibold text-sm">
                      {item.name}{" "}
                    </span>
                    <span className="text-gray-500 text-xs">{item.symbol}</span>
                    <p className="text-gray-400 text-sm mt-0.5">
                      {item.insight}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector analysis */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
            <div className="text-xs text-yellow-400 font-semibold uppercase tracking-wider mb-4">
              🏛 Sector Analysis
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: "DeFi", value: insights.sectorAnalysis?.defi },
                { label: "Layer 1", value: insights.sectorAnalysis?.layer1 },
                { label: "Altcoins", value: insights.sectorAnalysis?.altcoins },
              ].map((sector, i) => (
                <div
                  key={i}
                  className="pb-4 border-b border-gray-700 last:border-0 last:pb-0"
                >
                  <div className="text-white font-semibold text-sm mb-1">
                    {sector.label}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {sector.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
              📋 Full Market Summary
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {insights.summary}
            </p>
          </div>

          <p className="text-center text-gray-500 text-xs">
            AI-generated analysis based on live data from top 50 coins. Not
            financial advice.
          </p>

          <button
            onClick={generateInsights}
            disabled={isAnalyzing}
            className="mx-auto bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm disabled:opacity-50"
          >
            {isAnalyzing ? "Regenerating..." : "↻ Regenerate"}
          </button>
        </div>
      )}
    </div>
  );
}

export default InsightsPage;
