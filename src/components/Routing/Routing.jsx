import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "../../pages/Layout";
import PageLoader from "../PageLoader/PageLoader";
import CustomErrorBoundary from "../CustomErrorBoundary/CustomErrorBoundary";

const Home = lazy(() => import("../../pages/Home"));
const CoinDetailsPage = lazy(() => import("../../pages/CoinDetailsPage"));
const InsightsPage = lazy(() => import("../../pages/InsightsPage"));
const ComparePage = lazy(() => import("../../pages/ComparePage"));
const PortfolioPage = lazy(() => import("../../pages/PortfolioPage"));
const AskAIPage = lazy(() => import("../../pages/AskAIPage"));

function Routing() {
  return (
    <CustomErrorBoundary>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
          <Route path="/details/:coinId" element={<Suspense fallback={<PageLoader />}><CoinDetailsPage /></Suspense>} />
          <Route path="/insights" element={<Suspense fallback={<PageLoader />}><InsightsPage /></Suspense>} />
          <Route path="/compare" element={<Suspense fallback={<PageLoader />}><ComparePage /></Suspense>} />
          <Route path="/portfolio" element={<Suspense fallback={<PageLoader />}><PortfolioPage /></Suspense>} />
          <Route path="/ask" element={<Suspense fallback={<PageLoader />}><AskAIPage /></Suspense>} />
        </Route>
      </Routes>
    </CustomErrorBoundary>
  );
}

export default Routing;