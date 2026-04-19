import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Calendar, FileText, User, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import api from "@/services/api/client";
import {
  getCustomerAuthHeaders,
  getCustomerProfileCache,
} from "@/services/customer-session";

const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function CustomerDashboardPage() {
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalSpent: 0,
    upcomingBookings: 0,
    loyaltyPoints: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const headers = getCustomerAuthHeaders();

      if (!headers.Authorization) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/client/dashboard", { headers });
        setSummary(response.data?.summary || summary);
        setRecentOrders(response.data?.recentOrders || []);
        setRecentBookings(response.data?.recentBookings || []);
      } catch (error) {
        toast.error(extractErrorMessage(error, "Không thể tải dashboard"));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const profile = getCustomerProfileCache();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Chào mừng {profile?.name || "bạn"} đến với Nhà hàng ABC!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Khám phá thực đơn, đặt bàn và quản lý các đơn hàng của bạn.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-orange-500" />
              Đặt bàn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/customer/book-table">Mở trang đặt bàn</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="size-5 text-blue-500" />
              Thực đơn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/customer/menu">Xem thực đơn</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-green-500" />
              Đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/customer/orders">Xem đơn hàng</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <User className="size-5 text-purple-500" />
              Hồ sơ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/customer/profile">Mở hồ sơ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tổng đơn</p>
            <p className="text-2xl font-bold">{summary.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("vi-VN").format(summary.totalSpent)} ₫
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Booking sắp tới</p>
            <p className="text-2xl font-bold">{summary.upcomingBookings}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
          <CardDescription>Những đơn hàng mới nhất từ backend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          ) : recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{order.orderCode}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.date).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    {new Intl.NumberFormat("vi-VN").format(order.total)} ₫
                  </p>
                  <p className="text-sm text-green-600">{order.status}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có đơn hàng nào.
            </p>
          )}

          {recentBookings.length > 0 ? (
            <div className="pt-2">
              <p className="mb-2 text-sm font-medium">Booking sắp tới</p>
              <div className="space-y-2">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <span>
                      {booking.bookingDate} {booking.bookingTime}
                    </span>
                    <span>{booking.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
