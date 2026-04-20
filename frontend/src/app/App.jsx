import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import AdminLayout from "@/layouts/admin-layout";
import CustomerLayout from "@/layouts/customer-layout";
import Dashboard from "@/features/dashboard/pages/dashboard-page";
import Table from "@/features/tables/pages/table-page";
import Menu from "@/features/menu/pages/menu-page";
import Staff from "@/features/staff/pages/staff-page";
import ManageCustomersPage from "@/features/customers/pages/manage-customers-page";
import ManageInvoicesPage from "@/features/orders/pages/manage-invoices-page";
import AnalyticsDashboardPage from "@/features/analytics/pages/analytics-dashboard-page";
import InventoryPage from "@/features/inventory/pages/inventory-page";
import CustomerHome from "@/features/customer-dashboard/pages/customer-home-page";
import CustomerDashboardPage from "@/features/customer-dashboard/pages/customer-dashboard-page";
import BookTablePage from "@/features/customer-booking/pages/book-table-page";
import MenuPage from "@/features/customer-menu/pages/customer-menu-page";
import OrderHistoryPage from "@/features/customer-orders/pages/order-history-page";
import ProfilePage from "@/features/profile/pages/profile-page";
import HomePage from "@/features/home/pages/home-page";
import NotFound from "@/features/errors/pages/not-found-page";
import AdminLoginPage from "@/features/auth/pages/admin-login-page";
import CustomerLoginPage from "@/features/auth/pages/customer-login-page";

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/login" element={<CustomerLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tables" element={<Table />} />
            <Route path="menu" element={<Menu />} />
            <Route path="staff" element={<Staff />} />
            <Route path="customers" element={<ManageCustomersPage />} />
            <Route path="orders" element={<ManageInvoicesPage />} />
            <Route path="inventories" element={<InventoryPage />} />
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
