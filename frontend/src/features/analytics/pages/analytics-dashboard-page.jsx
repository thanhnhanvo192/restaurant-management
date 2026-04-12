import { useMemo, useState } from "react";
import {
  Download,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  UserPlus,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import {
  eachDayOfInterval,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isValid,
  parseISO,
  subDays,
} from "date-fns";
import {
  Area,
  AreaChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

const CATEGORY_COLORS = ["#14b8a6", "#3b82f6", "#f59e0b", "#ef4444"];

const formatCurrencyVND = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(value)} ₫`;

const MOCK_ANALYTICS = {
  today: {
    revenueSeries: [
      { label: "08:00", revenue: 1200000 },
      { label: "09:00", revenue: 1750000 },
      { label: "10:00", revenue: 2100000 },
      { label: "11:00", revenue: 3500000 },
      { label: "12:00", revenue: 4800000 },
      { label: "13:00", revenue: 3900000 },
      { label: "14:00", revenue: 2600000 },
      { label: "15:00", revenue: 2200000 },
      { label: "16:00", revenue: 2800000 },
      { label: "17:00", revenue: 4300000 },
      { label: "18:00", revenue: 5100000 },
      { label: "19:00", revenue: 5600000 },
      { label: "20:00", revenue: 4900000 },
    ],
    totalOrders: 126,
    newCustomers: 18,
    bestSeller: { name: "Bò lúc lắc", quantity: 57 },
    previousRevenue: 43800000,
    categoryRevenue: [
      { name: "Khai vị", value: 9200000 },
      { name: "Món chính", value: 28600000 },
      { name: "Tráng miệng", value: 5400000 },
      { name: "Đồ uống", value: 8400000 },
    ],
    topStaff: [
      { name: "Nguyen Minh Duc", orders: 31, revenue: 12600000 },
      { name: "Tran Thi Lan", orders: 28, revenue: 11200000 },
      { name: "Pham Quynh Anh", orders: 24, revenue: 9800000 },
      { name: "Dang Minh Chau", orders: 22, revenue: 9100000 },
      { name: "Le Hoang Long", orders: 21, revenue: 8700000 },
    ],
  },
  week: {
    revenueSeries: [
      { label: "T2", revenue: 18600000 },
      { label: "T3", revenue: 20400000 },
      { label: "T4", revenue: 22800000 },
      { label: "T5", revenue: 24100000 },
      { label: "T6", revenue: 26500000 },
      { label: "T7", revenue: 31400000 },
      { label: "CN", revenue: 29800000 },
    ],
    totalOrders: 742,
    newCustomers: 96,
    bestSeller: { name: "Cá hồi sốt bơ chanh", quantity: 198 },
    previousRevenue: 161000000,
    categoryRevenue: [
      { name: "Khai vị", value: 33800000 },
      { name: "Món chính", value: 94600000 },
      { name: "Tráng miệng", value: 20400000 },
      { name: "Đồ uống", value: 36200000 },
    ],
    topStaff: [
      { name: "Nguyen Minh Duc", orders: 155, revenue: 50100000 },
      { name: "Tran Thi Lan", orders: 149, revenue: 47800000 },
      { name: "Pham Quynh Anh", orders: 144, revenue: 45200000 },
      { name: "Dang Minh Chau", orders: 142, revenue: 43800000 },
      { name: "Le Hoang Long", orders: 138, revenue: 42100000 },
    ],
  },
  month: {
    revenueSeries: [
      { label: "01/03", revenue: 20500000 },
      { label: "04/03", revenue: 23800000 },
      { label: "07/03", revenue: 21900000 },
      { label: "10/03", revenue: 24600000 },
      { label: "13/03", revenue: 25200000 },
      { label: "16/03", revenue: 27300000 },
      { label: "19/03", revenue: 26100000 },
      { label: "22/03", revenue: 28900000 },
      { label: "25/03", revenue: 30600000 },
      { label: "28/03", revenue: 32100000 },
    ],
    totalOrders: 3087,
    newCustomers: 382,
    bestSeller: { name: "Lẩu hải sản", quantity: 744 },
    previousRevenue: 910000000,
    categoryRevenue: [
      { name: "Khai vị", value: 162000000 },
      { name: "Món chính", value: 511000000 },
      { name: "Tráng miệng", value: 110000000 },
      { name: "Đồ uống", value: 196000000 },
    ],
    topStaff: [
      { name: "Nguyen Minh Duc", orders: 612, revenue: 203000000 },
      { name: "Tran Thi Lan", orders: 598, revenue: 197000000 },
      { name: "Pham Quynh Anh", orders: 586, revenue: 190000000 },
      { name: "Dang Minh Chau", orders: 571, revenue: 184000000 },
      { name: "Le Hoang Long", orders: 553, revenue: 176000000 },
    ],
  },
};

const getTotalRevenue = (series) =>
  series.reduce((sum, point) => sum + point.revenue, 0);

const buildCustomAnalytics = (dateRange, referenceData) => {
  if (!dateRange.from || !dateRange.to) {
    return referenceData;
  }

  const fromDate = startOfDaySafe(dateRange.from);
  const toDate = endOfDaySafe(dateRange.to);

  if (!fromDate || !toDate || isAfter(fromDate, toDate)) {
    return referenceData;
  }

  const days = eachDayOfInterval({ start: fromDate, end: toDate });

  // Sinh dữ liệu mô phỏng theo khoảng ngày để dashboard phản hồi theo bộ lọc.
  const revenueSeries = days.map((day, index) => {
    const daySeed = day.getDate() * 93000;
    const revenue = 12500000 + daySeed + (index % 5) * 1150000;
    return {
      label: format(day, "dd/MM"),
      revenue,
    };
  });

  const totalRevenue = getTotalRevenue(revenueSeries);
  const totalOrders = Math.max(1, Math.round(totalRevenue / 310000));
  const newCustomers = Math.max(1, Math.round(days.length * 4.2));

  const categoryRevenue = [
    { name: "Khai vị", value: Math.round(totalRevenue * 0.18) },
    { name: "Món chính", value: Math.round(totalRevenue * 0.51) },
    { name: "Tráng miệng", value: Math.round(totalRevenue * 0.12) },
    { name: "Đồ uống", value: Math.round(totalRevenue * 0.19) },
  ];

  const topStaff = [
    {
      name: "Nguyen Minh Duc",
      orders: Math.round(totalOrders * 0.22),
      revenue: Math.round(totalRevenue * 0.22),
    },
    {
      name: "Tran Thi Lan",
      orders: Math.round(totalOrders * 0.2),
      revenue: Math.round(totalRevenue * 0.2),
    },
    {
      name: "Pham Quynh Anh",
      orders: Math.round(totalOrders * 0.18),
      revenue: Math.round(totalRevenue * 0.18),
    },
    {
      name: "Dang Minh Chau",
      orders: Math.round(totalOrders * 0.17),
      revenue: Math.round(totalRevenue * 0.17),
    },
    {
      name: "Le Hoang Long",
      orders: Math.round(totalOrders * 0.15),
      revenue: Math.round(totalRevenue * 0.15),
    },
  ];

  return {
    revenueSeries,
    totalOrders,
    newCustomers,
    bestSeller: {
      name: days.length > 10 ? "Cá hồi sốt bơ chanh" : "Bò lúc lắc",
      quantity: Math.round(totalOrders * 0.24),
    },
    previousRevenue: Math.round(totalRevenue * 0.92),
    categoryRevenue,
    topStaff,
  };
};

function startOfDaySafe(isoDateString) {
  const parsed = parseISO(isoDateString);
  if (!isValid(parsed)) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function endOfDaySafe(isoDateString) {
  const parsed = parseISO(isoDateString);
  if (!isValid(parsed)) return null;
  parsed.setHours(23, 59, 59, 999);
  return parsed;
}

function StatsCards({
  totalRevenue,
  previousRevenue,
  totalOrders,
  newCustomers,
  bestSeller,
}) {
  const revenueChange =
    previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;
  const isUp = revenueChange >= 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tổng doanh thu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-2xl font-bold">
            {formatCurrencyVND(totalRevenue)}
          </p>
          <Badge
            className={
              isUp
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }
          >
            {isUp ? (
              <TrendingUp className="mr-1 size-3.5" />
            ) : (
              <TrendingDown className="mr-1 size-3.5" />
            )}
            {`${isUp ? "+" : ""}${revenueChange.toFixed(1)}% so với kỳ trước`}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tổng số đơn hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="inline-flex items-center gap-2 text-2xl font-bold">
            <ShoppingBag className="text-blue-600 size-5" />
            {new Intl.NumberFormat("vi-VN").format(totalOrders)}
          </div>
          <p className="text-xs text-muted-foreground">
            Đơn hàng hoàn tất trong kỳ
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Khách hàng mới
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="inline-flex items-center gap-2 text-2xl font-bold">
            <UserPlus className="size-5 text-violet-600" />
            {new Intl.NumberFormat("vi-VN").format(newCustomers)}
          </div>
          <p className="text-xs text-muted-foreground">
            Khách lần đầu phát sinh đơn
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Món bán chạy nhất
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="inline-flex items-center gap-2 text-lg font-semibold">
            <UtensilsCrossed className="size-5 text-amber-600" />
            {bestSeller.name}
          </div>
          <p className="text-xs text-muted-foreground">
            Đã bán {bestSeller.quantity} phần
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function RevenueAreaChart({ data }) {
  return (
    <Card className="col-span-1 xl:col-span-2">
      <CardHeader>
        <CardTitle>Doanh thu theo thời gian</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 12, right: 16, left: 4, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${Math.round(value / 1000000)}tr`}
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrencyVND(Number(value)),
                  "Doanh thu",
                ]}
                labelFormatter={(label) => `Mốc thời gian: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0ea5e9"
                fill="url(#revenueGradient)"
                strokeWidth={2.5}
                animationDuration={900}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryPieChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tỷ lệ doanh thu theo danh mục</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="48%"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={3}
                animationDuration={900}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrencyVND(Number(value))}
              />
              <Legend verticalAlign="bottom" height={24} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function TopStaffTable({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 nhân viên</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tên nhân viên</TableHead>
              <TableHead className="text-right">Số đơn</TableHead>
              <TableHead className="text-right">Doanh thu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((staff, index) => (
              <TableRow key={staff.name}>
                <TableCell>
                  <Badge variant="outline">#{index + 1}</Badge>
                </TableCell>
                <TableCell className="font-medium">{staff.name}</TableCell>
                <TableCell className="text-right">{staff.orders}</TableCell>
                <TableCell className="font-semibold text-right">
                  {formatCurrencyVND(staff.revenue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const AnalyticsDashboardPage = () => {
  const [analyticsData] = useState(MOCK_ANALYTICS);
  const [timeFilter, setTimeFilter] = useState("week");
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 6), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });

  const currentData = useMemo(() => {
    if (timeFilter === "today") return analyticsData.today;
    if (timeFilter === "week") return analyticsData.week;
    if (timeFilter === "month") return analyticsData.month;
    return buildCustomAnalytics(dateRange, analyticsData.week);
  }, [analyticsData, dateRange, timeFilter]);

  const totalRevenue = useMemo(
    () => getTotalRevenue(currentData.revenueSeries),
    [currentData.revenueSeries],
  );

  const handleExportReport = () => {
    // Demo hành động export, thực tế sẽ gọi API backend tạo file.
    window.alert("Đang xuất báo cáo PDF/Excel (mô phỏng).");
  };

  return (
    <section className="p-4 space-y-6 md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Báo cáo & Thống kê
            </h1>
            <p className="text-sm text-muted-foreground">
              Theo dõi hiệu suất kinh doanh nhà hàng dành cho Quản trị viên.
            </p>
          </div>

          <Tabs value={timeFilter} onValueChange={setTimeFilter}>
            <TabsList>
              <TabsTrigger value="today">Hôm nay</TabsTrigger>
              <TabsTrigger value="week">7 ngày qua</TabsTrigger>
              <TabsTrigger value="month">Tháng này</TabsTrigger>
              <TabsTrigger value="custom">Tùy chỉnh</TabsTrigger>
            </TabsList>
          </Tabs>

          {timeFilter === "custom" ? (
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-full max-w-xl"
            />
          ) : null}
        </div>

        <Button onClick={handleExportReport} className="w-full xl:w-auto">
          <Download className="mr-2 size-4" />
          Xuất báo cáo PDF/Excel
        </Button>
      </div>

      <StatsCards
        totalRevenue={totalRevenue}
        previousRevenue={currentData.previousRevenue}
        totalOrders={currentData.totalOrders}
        newCustomers={currentData.newCustomers}
        bestSeller={currentData.bestSeller}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <RevenueAreaChart data={currentData.revenueSeries} />
        <TopStaffTable data={currentData.topStaff} />
      </div>

      <CategoryPieChart data={currentData.categoryRevenue} />

      <Card className="border-dashed">
        <CardContent className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
          <Wallet className="size-4" />
          Tất cả doanh thu đã được định dạng theo chuẩn tiền tệ Việt Nam
          (xxx.xxx ₫).
        </CardContent>
      </Card>
    </section>
  );
};

export default AnalyticsDashboardPage;
