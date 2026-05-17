import { useQuery } from "react-query";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCoinDetails } from "../Services/fetchCoinDetails";
import currencyStore from "../state/store";
import parse from "html-react-parser";
import PageLoader from "../components/PageLoader/PageLoader";
import CoinInfoContainer from "../components/CoinInfo/CoiinInfoContainer";
import AIChatbot from "../components/AIChatbot/AIChatbot";
import AINewsSentiment from "../components/AINewsSentiment/AINewsSentiment";

function CoinDetailsPage() {
  const { coinId } = useParams();
  const navigate = useNavigate();
  const { currency } = currencyStore();
  const symbol = currency === "inr" ? "₹" : "$";

  const {
    isError,
    isLoading,
    data: coin,
  } = useQuery(["coin", coinId], () => fetchCoinDetails(coinId), {
    cacheTime: 1000 * 60 * 2,
    staleTime: 1000 * 60 * 2,
  });

  if (isLoading) return <PageLoader />;
  if (isError)
    return (
      <div className="text-center text-red-400 py-20">
        Something went wrong. Please go back and try again.
      </div>
    );

  const price = coin?.market_data?.current_price?.[currency];
  const priceChange =
    coin?.market_data?.price_change_percentage_24h?.toFixed(2);
  const isPositive = priceChange >= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors"
      >
        ← Back to market
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left panel — coin info */}
        <div className="lg:w-1/3 w-full">
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 flex flex-col items-center text-center sticky top-24">
            <img
              src={coin?.image?.large}
              alt={coin?.name}
              className="w-24 h-24 mb-4 rounded-full"
            />

            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold text-white">{coin?.name}</h1>
            </div>

            <span className="text-gray-400 uppercase text-sm mb-6">
              {coin?.symbol}
            </span>

            {/* Stats */}
            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-900 rounded-xl p-3">
                <div className="text-gray-400 text-xs mb-1">Rank</div>
                <div className="text-white font-bold text-lg">
                  #{coin?.market_cap_rank}
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl p-3">
                <div className="text-gray-400 text-xs mb-1">24h Change</div>
                <div
                  className={`font-bold text-lg ${isPositive ? "text-green-400" : "text-red-400"}`}
                >
                  {isPositive ? "+" : ""}
                  {priceChange}%
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl p-3 col-span-2">
                <div className="text-gray-400 text-xs mb-1">Current Price</div>
                <div className="text-yellow-400 font-bold text-2xl">
                  {symbol}
                  {price?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="text-gray-400 text-sm text-left leading-relaxed max-h-48 overflow-y-auto">
              {parse(coin?.description?.en?.slice(0, 800) || "")}
            </div>
          </div>
        </div>

        {/* Right panel — chart + chatbot */}
        <div className="lg:w-2/3 w-full flex flex-col gap-6">
  <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden">
    <CoinInfoContainer coinId={coinId} coinName={coin?.name} coinSymbol={coin?.symbol} />
  </div>
  <AINewsSentiment coinName={coin?.name} coinSymbol={coin?.symbol} />
  <AIChatbot coin={coin} currency={currency} />
</div>
      </div>
    </div>
  );
}

export default CoinDetailsPage;
