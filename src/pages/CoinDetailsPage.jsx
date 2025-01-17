import { useParams } from "react-router-dom";

function CoinDetailsPage(){
    const {coinId}=useParams();
    return(
        <div>
            <h1>coin details {coinId}
            </h1>
        </div>
    )
}
export default CoinDetailsPage;