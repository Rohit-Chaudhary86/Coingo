import Bannerimage from "../../assets/banner1.jpeg"
function Banner(){
    return(
        <div  className="w-full h-[25rem] relative" >
            <img src={Bannerimage} 
            className="h-full w-full"
            />

            <div className="absolute top-10 left-0 right-0 mx-auto w-[20rem]">
               <div className="flex flex-col gap-4">

                    <div className="font-semibold text-5xl text-white">
                       crypto tracker
                    </div>
                    <div className="font-semibold text-sm text-white text-center">
                       Get all info regarding cripto currency
                    </div>

                </div>

            </div>
        </div>


    )
}
export default Banner;