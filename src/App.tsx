import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Specifications from "./pages/Specifications";
import Telegram from "./pages/Telegram";
import History from "./pages/History";
import Statistics from "./pages/Statistics";
import SensorDetail from "./pages/SensorDetail";
import UserGuide from "./pages/UserGuide";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/specifications" element={<Specifications />} />
            <Route path="/telegram" element={<Telegram />} />
            <Route path="/history" element={<History />} />
            <Route path="/sensor/:id" element={<SensorDetail />} />
            <Route path="/sensors/:id" element={<SensorDetail />} />
            <Route path="/user-guide" element={<UserGuide />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
