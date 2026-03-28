import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashborad";
import { TooltipProvider } from "@/components/ui/tooltip";
import Table from "./pages/Table";
import Menu from "./pages/Menu";
import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tables" element={<Table />} />
            <Route path="menu" element={<Menu />} />
          </Route>

          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
