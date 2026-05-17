import { useState, useRef } from "react";
import { fetchCoinData } from "../../Services/fetchCoinData";
import { useQuery } from "react-query";
import currencyStore from "../../state/store";
import { useNavigate } from "react-router-dom";
import PageLoader from "../../components/PageLoader/PageLoader";
import SentimentBadge from "../SentimentBadge/SentimentBadge";

function CoinTable() {
  const { currency } = currencyStore();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCoins, setFilteredCoins] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLabel, setSearchLabel] = useState("");
  const searchRef = useRef(null);

  const { data, isLoading, isError } = useQuery(
    ["coins", page, currency],
    () => fetchCoinData(page, currency),
    { cacheTime: 1000 * 60 * 2, staleTime: 1000 * 60 * 2 }
  );

  const symbol = currency === "inr" ? "₹" : "$";

  async function handleNaturalSearch() {
    if (!searchQuery.trim() || !data) return;
    setIsSearching(true);
    setSearchLabel("");

    try {
      const coinSummary = data.map((c) => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        price: c.current_price,
        change24h: c.price_change_percentage_24h?.toFixed(2),
        marketCap: c.market_cap,
        rank: c.market_cap_rank,
      }));

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
            max_tokens: 200,
            messages: [
              {
                role: "system",
                content: `You are a crypto filter assistant. Given a list of coins and a user query, return ONLY a JSON array of coin IDs that match. Example: ["bitcoin","ethereum"]. Return empty array [] if none match. No explanation, no markdown, just the JSON array.`,
              },
              {
                role: "user",
                content: `Coins: ${JSON.stringify(coinSummary)}\n\nUser query: "${searchQuery}"\n\nReturn matching coin IDs as JSON array only.`,
              },
            ],
          }),
        }
      );

      const result = await response.json();
      const text = result.choices[0].message.content.trim();
      const ids = JSON.parse(text);
      const matched = data.filter((c) => ids.includes(c.id));
      setFilteredCoins(matched);
      setSearchLabel(`"${searchQuery}" — ${matched.length} result${matched.length !== 1 ? "s" : ""}`);
    } catch {
      setFilteredCoins([]);
      setSearchLabel("Couldn't process that search. Try again.");
    } finally {
      setIsSearching(false);
    }
  }

  function clearSearch() {
    setSearchQuery("");
    setFilteredCoins(null);
    setSearchLabel("");
  }

  if (isError) return <div className="text-center text-red-400 py-10">Failed to load coins.</div>;
  if (isLoading) return <PageLoader />;

  const displayCoins = filteredCoins !== null ? filteredCoins : data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Live Market</h2>
          <p className="text-gray-400 text-sm mt-1">
            Top coins by market cap · Click any coin for AI analysis
          </p>
        </div>
        <div className="text-xs text-gray-500 bg-gray-800 px-3 py-1.5 rounded-lg">
          Page {page}
        </div>
      </div>

      {/* AI Natural Language Search */}
      <div className="mb-6 flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400 text-sm font-bold">AI</span>
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNaturalSearch()}
            placeholder='Try: "coins up today" or "top 3 by market cap" or "find ethereum"'
            className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
        <button
          onClick={handleNaturalSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black font-bold px-5 rounded-xl transition-all text-sm"
        >
          {isSearching ? <span className="loading loading-spinner loading-sm"></span> : "Search"}
        </button>
        {filteredCoins !== null && (
          <button
            onClick={clearSearch}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 rounded-xl text-sm transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {/* Search label */}
      {searchLabel && (
        <div className="mb-4 text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-4 py-2 rounded-lg">
          🤖 {searchLabel}
        </div>
      )}

      {/* Table header */}
      <div className="w-full grid grid-cols-12 px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-4">Coin</div>
        <div className="col-span-2 text-right">Price</div>
        <div className="col-span-2 text-right">24h</div>
        <div className="col-span-2 text-right">Market Cap</div>
        <div className="col-span-1 text-right">AI</div>
      </div>

      {/* Coin rows */}
      <div className="flex flex-col">
        {displayCoins.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            No coins matched your search. Try something else.
          </div>
        )}
        {displayCoins.map((coin, index) => {
          const isPositive = coin.price_change_percentage_24h >= 0;
          return (
            <div
              onClick={() => navigate(`/details/${coin.id}`)}
              key={coin.id}
              className="grid grid-cols-12 px-4 py-4 items-center border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-all group"
            >
              <div className="col-span-1 text-center text-gray-500 text-sm">
                {coin.market_cap_rank}
              </div>

              <div className="col-span-4 flex items-center gap-3">
                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                <div>
                  <div className="text-white font-semibold text-sm group-hover:text-yellow-400 transition-colors">
                    {coin.name}
                  </div>
                  <div className="text-gray-500 text-xs uppercase">{coin.symbol}</div>
                </div>
              </div>

              <div className="col-span-2 text-right text-white font-medium text-sm">
                {symbol}{coin.current_price?.toLocaleString()}
              </div>

              <div className={`col-span-2 text-right font-semibold text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
                {isPositive ? "▲" : "▼"} {Math.abs(coin.price_change_percentage_24h?.toFixed(2))}%
              </div>

              <div className="col-span-2 text-right text-gray-400 text-sm">
                {symbol}{(coin.market_cap / 1e9).toFixed(2)}B
              </div>

              <div className="col-span-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
                <SentimentBadge coin={coin} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination — hide when search active */}
      {filteredCoins === null && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-6 py-2 rounded-xl bg-gray-800 text-white font-semibold disabled:opacity-30 hover:bg-gray-700 transition-all"
          >
            ← Previous
          </button>
          <span className="text-gray-400 text-sm">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            className="px-6 py-2 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default CoinTable;