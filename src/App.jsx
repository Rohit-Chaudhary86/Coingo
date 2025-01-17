// import { useState } from 'react'
import './App.css'

import Home from './pages/Home'
// import { CurrencyContext } from './context/CurrencyContext'

function App() {
  // const[currency,setCurrency]= useState("USD")
  return (
   <>
   {/* <CurrencyContext.Provider value={{currency,setCurrency}}> */}
      <Home />
   {/* </CurrencyContext.Provider> */}
   
   </>
  )
}
export default App
