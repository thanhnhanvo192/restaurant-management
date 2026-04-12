/**
 * OrderHistoryPage - Trang xem lịch sử đơn hàng
 * Khách hàng có thể xem, tìm kiếm, và xem chi tiết các đơn hàng đã đặt
 */

import { useState } from "react";
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

// Mock data: Lịch sử đơn hàng
const MOCK_ORDERS = [
  {
    id: "#ORD-10005",
    date: "2024-04-05",
    time: "19:30",
    items: ["Cơm tấm sườn non", "Nước mía", "Bánh flan"],
    total: 450000,
    status: "completed",
    rating: 5,
  },
  {
    id: "#ORD-10004",
    date: "2024-04-03",
    time: "12:00",
    items: ["Phở bò", "Nước chanh", "Tráng miệng"],
    total: 320000,
    status: "completed",
    rating: 4,
  },
  {
    id: "#ORD-10003",
    date: "2024-03-28",
    time: "18:00",
    items: ["Bún chả", "Bia", "Chè đậu xanh"],
    total: 380000,
    status: "completed",
    rating: 5,
  },
  {
    id: "#ORD-10002",
    date: "2024-03-20",
    time: "13:30",
    items: ["Cơm chiên Dương Châu", "Canh chua"],
    total: 280000,
    status: "completed",
    rating: 3,
  },
  {
    id: "#ORD-10001",
    date: "2024-03-15",
    time: "19:00",
    items: ["Lẩu hải sản", "Rượu vang"],
    total: 950000,
    status: "completed",
    rating: 5,
  },
];

const getStatusBadge = (status) => {
  const statusMap = {
    completed: { label: "Đã hoàn thành", variant: "default" },
    pending: { label: "Đang chờ", variant: "outline" },
    cancelled: { label: "Đã hủy", variant: "destructive" },
  };
  const config = statusMap[status] || statusMap.pending;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getStarRating = (rating) => {
  return "⭐".repeat(rating) || "Chưa đánh giá";
};

export default function OrderHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Lọc đơn hàng
  const filteredOrders = MOCK_ORDERS.filter((order) => {
    const matchSearch = order.id.includes(searchTerm);
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSpent = MOCK_ORDERS.reduce((sum, order) => sum + order.total, 0);
  const completedOrders = MOCK_ORDERS.length;
  const averageRating = (
    MOCK_ORDERS.reduce((sum, order) => sum + (order.rating || 0), 0) /
    MOCK_ORDERS.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lịch sử đơn hàng</h1>
        <p className="text-muted-foreground mt-2">
          Xem chi tiết tất cả các đơn hàng của bạn
        </p>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Tổng chi tiêu */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalSpent / 1000000).toFixed(1)}M ₫
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {MOCK_ORDERS.length} đơn hàng
            </p>
          </CardContent>
        </Card>

        {/* Số lượng đơn hàng */}
        <Card>
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
        <Card>
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Tìm kiếm & Lọc</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-col sm:flex-row">
          {/* Tìm kiếm */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã đơn (VD: #ORD-10005)..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lọc theo trạng thái */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="completed">Đã hoàn thành</SelectItem>
              <SelectItem value="pending">Đang chờ</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Danh sách đơn hàng */}
      <div className="space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() =>
                setExpandedOrder(expandedOrder === order.id ? null : order.id)
              }
            >
              <CardContent className="pt-6">
                {/* Header đơn hàng */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{order.id}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="size-4" />
                      {order.date} • {order.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {(order.total / 1000).toFixed(0)}k ₫
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Chi tiết mở rộng */}
                {expandedOrder === order.id && (
                  <>
                    {/* Danh sách items */}
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">Các món ăn:</h4>
                      <ul className="space-y-1 ml-4">
                        {order.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-muted-foreground list-disc"
                          >
                            {item}
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
                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText className="size-4 mr-2" />
                        Chi tiết
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Đặt lại
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
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
