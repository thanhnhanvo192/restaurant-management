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
import AnalyticsDashboardPage from "./pages/Analytics/AnalyticsDashboardPage";
import CustomerLayout from "./layouts/CustomerLayout";
import CustomerHome from "./pages/Customer/CustomerHome";
import CustomerDashboardPage from "./pages/Customer/CustomerDashboardPage";
import BookTablePage from "./pages/Customer/BookTablePage";
import MenuPage from "./pages/Customer/MenuPage";
import OrderHistoryPage from "./pages/Customer/OrderHistoryPage";
import ProfilePage from "./pages/Customer/ProfilePage";

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
            <Route path="reports" element={<AnalyticsDashboardPage />} />
          </Route>
          {/* Các route dành cho khách hàng */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<CustomerHome />} />
            <Route path="dashboard" element={<CustomerDashboardPage />} />
            <Route path="book-table" element={<BookTablePage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="orders" element={<OrderHistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
