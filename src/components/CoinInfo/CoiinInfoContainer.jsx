import { useQuery } from "react-query";
import CoinInfo from "./CoinInfo";
import currencyStore from "../../state/store";
import { useState } from "react";
import { fetchCoinHistoricData } from "../../Services/fetchCoinHistoricData";
import PageLoader from "../PageLoader/PageLoader";
import Alert from "../Alert/Alert";
import AIPriceSummary from "../AIPriceSummary/AIPriceSummary";
import AIPricePrediction from "../AIPricePrediction/AIPricePrediction";

function CoinInfoContainer({ coinId, coinName, coinSymbol }) {
  const { currency } = currencyStore();
  const [days, setDays] = useState(7);
  const [interval, setCoinInterval] = useState("daily");

  const { data: historicData, isLoading, isError } = useQuery(
    ["coinHistoricData", coinId, currency, days, interval],
    () => fetchCoinHistoricData(coinId, interval, days, currency),
    { cacheTime: 1000 * 60 * 2, staleTime: 1000 * 60 * 2 }
  );

  if (isLoading) return <PageLoader />;
  if (isError) return <Alert message="Error fetching chart data" type="error" />;

  return (
    <div className="flex flex-col gap-4 p-4">
      <CoinInfo
        historicData={historicData}
        setDays={setDays}
        setCoinInterval={setCoinInterval}
        days={days}
        currency={currency}
      />
      <AIPriceSummary
        coinName={coinName}
        coinSymbol={coinSymbol}
        days={days}
        currency={currency}
        historicData={historicData}
      />
      <AIPricePrediction
        coinName={coinName}
        coinSymbol={coinSymbol}
        currency={currency}
        historicData={historicData}
      />
    </div>
  );
}

export default CoinInfoContainer;