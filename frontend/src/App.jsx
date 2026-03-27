import { Toaster, toast } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashborad";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
