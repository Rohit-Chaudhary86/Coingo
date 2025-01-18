import { useQuery } from "react-query";
import CoinInfo from "./CoinInfo"
import currencyStore from "../../state/store"
import { useState } from "react";
import { fetchCoinHistoricData } from "../../Services/fetchCoinHistoricData";
import PageLoader from "../PageLoader/PageLoader"

function CoinInfoContainer({coinId}){
    const {currency}= currencyStore();
    const[days,setDays]=useState(7);
    const[interval,setCoinInterval]=useState('');

    const {data:historicData,isLoading,isError}=useQuery(['coinHistoricData',coinId,currency,days,interval],
        ()=>fetchCoinHistoricData(coinId,interval,days,currency),{
            cacheTime:1000*60*2,
            staleTime:1000*60*2,
        });
    
        if(isLoading){
            return <PageLoader />
        }
        if(isError){
            return <Alert message="Error in fetching data" type="Error"/>
        }

    return(
        <div>
           <CoinInfo 
           historicData={historicData} 
           setDays={setDays} 
           setCoinInterval={setCoinInterval}
           days={days}
           currency={currency}
           />
        </div>
    )
}
export default CoinInfoContainer