/**
 * OrderHistoryPage - Trang xem lịch sử đơn hàng
 * Khách hàng có thể xem, tìm kiếm, và xem chi tiết các đơn hàng đã đặt
 */

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Clock, FileText, Search, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import api from "@/services/api/client";
import { getCustomerAuthHeaders } from "@/services/customer-session";

const normalizeOrder = (order) => ({
  id: order.id || order._id || order.orderCode,
  orderCode: order.orderCode || order.id || order._id || "",
  status: order.status || "pending",
  items: Array.isArray(order.items) ? order.items : [],
  totalAmount: Number(order.totalAmount || order.total || 0),
  createdAt: order.createdAt || order.date || null,
  rating: order.rating || 0,
});

const getStatusBadge = (status) => {
  const statusMap = {
    completed: {
      label: "Đã hoàn thành",
      className: "bg-sky-100 text-sky-700 hover:bg-sky-100",
    },
    pending: {
      label: "Đang chờ",
      className:
        "bg-[hsl(var(--customer-surface-soft))] text-[hsl(var(--customer-text-accent))] hover:bg-[hsl(var(--customer-surface-soft))]",
    },
    canceled: {
      label: "Đã hủy",
      className: "bg-slate-100 text-slate-700 hover:bg-slate-100",
    },
    cancelled: {
      label: "Đã hủy",
      className: "bg-slate-100 text-slate-700 hover:bg-slate-100",
    },
  };
  const config = statusMap[status] || statusMap.pending;
  return <Badge className={config.className}>{config.label}</Badge>;
};

const getStarRating = (rating) => {
  return "⭐".repeat(rating) || "Chưa đánh giá";
};

export default function OrderHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(getCustomerAuthHeaders().Authorization),
  );

  useEffect(() => {
    const loadOrders = async () => {
      const headers = getCustomerAuthHeaders();
      const hasAuth = Boolean(headers.Authorization);

      setIsAuthenticated(hasAuth);

      if (!hasAuth) {
        setLoading(false);
        setOrders([]);
        return;
      }

      try {
        const response = await api.get("/client/orders", { headers });
        const nextOrders =
          response.data?.orders || response.data?.orderHistory || [];
        setOrders(nextOrders.map(normalizeOrder));
      } catch (error) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Lọc đơn hàng
  const filteredOrders = orders.filter((order) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchSearch =
      normalizedSearch.length === 0 ||
      (order.orderCode || order.id || "")
        .toLowerCase()
        .includes(normalizedSearch);
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const completedOrders = orders.filter(
    (order) => order.status === "completed",
  ).length;
  const averageRating = (
    orders.reduce((sum, order) => sum + (order.rating || 0), 0) /
    (orders.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <section className="overflow-hidden rounded-3xl border border-[hsl(var(--customer-border))] bg-white shadow-sm">
        <div className="bg-linear-to-r from-[hsl(var(--customer-primary))] to-[hsl(var(--customer-bg))] p-5 text-white md:p-6">
          <Badge className="bg-white/20 text-white hover:bg-white/20">
            Theo dõi đơn hàng
          </Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Lịch sử đơn hàng của bạn
          </h1>
          <p className="mt-2 text-sm text-white/90 md:text-base">
            Tra cứu nhanh mã đơn, trạng thái và tổng chi tiêu theo thời gian.
          </p>
        </div>
      </section>

      {/* Thống kê nhanh */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Tổng chi tiêu */}
        <Card className="border-[hsl(var(--customer-border))] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[hsl(var(--customer-text-accent))]">
              {(totalSpent / 1000000).toFixed(1)}M ₫
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {orders.length} đơn hàng
            </p>
          </CardContent>
        </Card>

        {/* Số lượng đơn hàng */}
        <Card className="border-[hsl(var(--customer-border))] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tất cả đã hoàn thành
            </p>
          </CardContent>
        </Card>

        {/* Điểm đánh giá trung bình */}
        <Card className="border-[hsl(var(--customer-border))] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Đánh giá trung bình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ⭐ {averageRating}/5
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tìm kiếm & Lọc */}
      <Card className="border-[hsl(var(--customer-border))] bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Tìm kiếm & Lọc</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-col sm:flex-row">
          {/* Tìm kiếm */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã đơn (VD: #ORD-10005)..."
              className="border-[hsl(var(--customer-border))] bg-[hsl(var(--customer-surface-soft)/0.6)] pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lọc theo trạng thái */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full border-[hsl(var(--customer-border))] bg-[hsl(var(--customer-surface-soft)/0.6)] sm:w-45">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="completed">Đã hoàn thành</SelectItem>
              <SelectItem value="pending">Đang chờ</SelectItem>
              <SelectItem value="canceled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Danh sách đơn hàng */}
      <div className="space-y-3">
        {loading ? (
          <Card className="border-[hsl(var(--customer-border))] bg-white shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground">
              Đang tải đơn hàng...
            </CardContent>
          </Card>
        ) : !isAuthenticated ? (
          <Card className="border-[hsl(var(--customer-border))] bg-white shadow-sm">
            <CardContent className="py-12 text-center">
              <FileText className="size-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">
                Vui lòng đăng nhập để xem lịch sử đơn hàng
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Hệ thống sẽ truy xuất đơn hàng trực tiếp từ cơ sở dữ liệu sau
                khi bạn đăng nhập.
              </p>
            </CardContent>
          </Card>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card
              key={order.id || order.orderCode}
              className="cursor-pointer border-[hsl(var(--customer-border))] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              onClick={() =>
                setExpandedOrder(
                  expandedOrder === (order.id || order.orderCode)
                    ? null
                    : order.id || order.orderCode,
                )
              }
            >
              <CardContent className="pt-6">
                {/* Header đơn hàng */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {order.orderCode || order.id}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4" />
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("vi-VN")
                        : "Không có thời gian"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {new Intl.NumberFormat("vi-VN").format(order.totalAmount)}{" "}
                      ₫
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Chi tiết mở rộng */}
                {expandedOrder === (order.id || order.orderCode) && (
                  <>
                    {/* Danh sách items */}
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">Các món ăn:</h4>
                      <ul className="space-y-1 ml-4">
                        {(order.items || []).map((item, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-muted-foreground list-disc"
                          >
                            {item.name} x{item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Đánh giá */}
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">Đánh giá:</h4>
                      <p className="text-lg">{getStarRating(order.rating)}</p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 border-t pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[hsl(var(--customer-border))] text-[hsl(var(--customer-text-accent))] hover:bg-[hsl(var(--customer-surface-soft))]"
                      >
                        <FileText className="size-4 mr-2" />
                        Chi tiết
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[hsl(var(--customer-border))] text-[hsl(var(--customer-text-accent))] hover:bg-[hsl(var(--customer-surface-soft))]"
                      >
                        Đặt lại
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-[hsl(var(--customer-border))] bg-white shadow-sm">
            <CardContent className="pt-6 text-center py-12">
              <FileText className="size-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Không tìm thấy đơn hàng</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
