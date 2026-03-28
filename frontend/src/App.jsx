import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashborad";
import { TooltipProvider } from "@/components/ui/tooltip";
import Table from "./pages/Table/Table";
import Menu from "./pages/Menu/Menu";
import AdminLayout from "./layouts/AdminLayout";
import Staff from "./pages/Staff/Staff";
import ManageCustomersPage from "./pages/Customer/ManageCustomersPage";
import ManageInvoicesPage from "./pages/Invoice/ManageInvoicesPage";

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
            <Route path="staff" element={<Staff />} />
            <Route path="customers" element={<ManageCustomersPage />} />
            <Route path="orders" element={<ManageInvoicesPage />} />
          </Route>

          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
