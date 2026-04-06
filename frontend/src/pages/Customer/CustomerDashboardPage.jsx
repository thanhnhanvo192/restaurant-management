/**
 * CustomerDashboardPage
 *
 * Trang Dashboard dành cho khách hàng
 * Được bọc bởi CustomerLayout
 *
 * Hiển thị:
 * - Chào mừng người dùng
 * - Các mục nhanh (Quick actions)
 * - Thông tin đơn hàng gần đây
 * - etc.
 */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UtensilsCrossed, Calendar, FileText, User } from "lucide-react";

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Chào mừng bạn đến với Nhà hàng ABC!
        </h1>
        <p className="text-muted-foreground mt-2">
          Khám phá thực đơn, đặt bàn và quản lý các đơn hàng của bạn.
        </p>
      </div>

      {/* Grid: Các nút hành động nhanh */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Đặt bàn */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-orange-500" />
              Đặt bàn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Đặt bàn cho buổi ăn tiếp theo
            </p>
          </CardContent>
        </Card>

        {/* Thực đơn */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="size-5 text-blue-500" />
              Thực đơn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Xem thực đơn và gọi món
            </p>
          </CardContent>
        </Card>

        {/* Lịch sử đơn hàng */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-green-500" />
              Đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Xem lịch sử đơn hàng của bạn
            </p>
          </CardContent>
        </Card>

        {/* Hồ sơ */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <User className="size-5 text-purple-500" />
              Hồ sơ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Quản lý thông tin cá nhân
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section: Đơn hàng gần đây */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
          <CardDescription>
            Những đơn hàng được tạo trong 30 ngày gần nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Danh sách đơn hàng (Mock data) */}
            {[1, 2, 3].map((order) => (
              <div
                key={order}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div>
                  <p className="font-medium">Đơn hàng #{10000 + order}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(Date.now() - order * 86400000).toLocaleDateString(
                      "vi-VN",
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    {(order * 150000).toLocaleString("vi-VN")} ₫
                  </p>
                  <p className="text-sm text-green-600">Đã hoàn thành</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Xem tất cả đơn hàng
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
