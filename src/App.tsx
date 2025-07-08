import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RegistroRonda from "./pages/RegistroRonda";
import RondasRegistradas from "./pages/RondasRegistradas";
import Reglas from "./pages/Reglas";
import ReglasAntiguas from "./pages/ReglasAntiguas";
import { RondasProvider } from "./context/RondasContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RondasProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/reglas" element={<Reglas />} />
            <Route path="/reglas-antiguas" element={<ReglasAntiguas />} />
            <Route path="/registro-ronda" element={<RegistroRonda />} />
            <Route path="/rondas-registradas" element={<RondasRegistradas />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RondasProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;