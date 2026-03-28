import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Eye,
  Gift,
  Lock,
  LockOpen,
  Search,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const PAGE_SIZE = 5;

const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: "Nguyen Tuan Kiet",
    phone: "0901234567",
    tier: "bronze",
    points: 320,
    joinedAt: "2025-12-12",
    lastVisitAt: "2026-03-26T18:30:00",
    isLocked: false,
    note: "Thích ngồi gần cửa sổ, dị ứng đậu phộng.",
    recentOrders: [
      {
        id: "OD-3201",
        date: "2026-03-26",
        total: 520000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3177",
        date: "2026-03-17",
        total: 345000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3098",
        date: "2026-02-28",
        total: 610000,
        status: "Đã thanh toán",
      },
    ],
  },
  {
    id: 2,
    name: "Tran Ngoc Bich",
    phone: "0912345678",
    tier: "silver",
    points: 840,
    joinedAt: "2026-03-03",
    lastVisitAt: "2026-03-24T20:15:00",
    isLocked: false,
    note: "Ưu tiên bàn yên tĩnh cho gia đình.",
    recentOrders: [
      {
        id: "OD-3199",
        date: "2026-03-24",
        total: 780000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3144",
        date: "2026-03-10",
        total: 460000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3041",
        date: "2026-02-20",
        total: 290000,
        status: "Đã thanh toán",
      },
    ],
  },
  {
    id: 3,
    name: "Le Hoang Long",
    phone: "0933777888",
    tier: "gold",
    points: 1500,
    joinedAt: "2025-10-21",
    lastVisitAt: "2026-03-25T12:10:00",
    isLocked: false,
    note: "Hay đặt suất trưa công ty.",
    recentOrders: [
      {
        id: "OD-3200",
        date: "2026-03-25",
        total: 1250000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3120",
        date: "2026-03-08",
        total: 940000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-2997",
        date: "2026-02-11",
        total: 670000,
        status: "Đã thanh toán",
      },
    ],
  },
  {
    id: 4,
    name: "Pham Quynh Anh",
    phone: "0988111222",
    tier: "diamond",
    points: 2800,
    joinedAt: "2024-08-19",
    lastVisitAt: "2026-03-20T19:00:00",
    isLocked: false,
    note: "Khách VIP, thường đặt bàn trước cuối tuần.",
    recentOrders: [
      {
        id: "OD-3181",
        date: "2026-03-20",
        total: 1860000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3090",
        date: "2026-02-27",
        total: 2010000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-2952",
        date: "2026-02-02",
        total: 980000,
        status: "Đã thanh toán",
      },
    ],
  },
  {
    id: 5,
    name: "Vo Gia Bao",
    phone: "0977444555",
    tier: "bronze",
    points: 210,
    joinedAt: "2026-02-11",
    lastVisitAt: "2026-03-18T21:45:00",
    isLocked: false,
    note: "Có con nhỏ, cần ghế em bé.",
    recentOrders: [
      {
        id: "OD-3165",
        date: "2026-03-18",
        total: 410000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3104",
        date: "2026-03-01",
        total: 330000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3018",
        date: "2026-02-15",
        total: 295000,
        status: "Đã thanh toán",
      },
    ],
  },
  {
    id: 6,
    name: "Dang Minh Chau",
    phone: "0966555777",
    tier: "silver",
    points: 910,
    joinedAt: "2026-03-10",
    lastVisitAt: "2026-03-27T11:40:00",
    isLocked: false,
    note: "Ưa món chay, cần tư vấn menu phù hợp.",
    recentOrders: [
      {
        id: "OD-3202",
        date: "2026-03-27",
        total: 560000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3159",
        date: "2026-03-16",
        total: 490000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3086",
        date: "2026-02-26",
        total: 420000,
        status: "Đã thanh toán",
      },
    ],
  },
  {
    id: 7,
    name: "Bui Anh Khoa",
    phone: "0944999000",
    tier: "gold",
    points: 1680,
    joinedAt: "2025-06-14",
    lastVisitAt: "2026-03-14T18:00:00",
    isLocked: true,
    note: "Khách đoàn nhỏ, thường 6-8 người.",
    recentOrders: [
      {
        id: "OD-3149",
        date: "2026-03-14",
        total: 1450000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3071",
        date: "2026-02-22",
        total: 990000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-2968",
        date: "2026-02-05",
        total: 870000,
        status: "Đã thanh toán",
      },
    ],
  },
  {
    id: 8,
    name: "Do Thu Trang",
    phone: "0922777888",
    tier: "bronze",
    points: 150,
    joinedAt: "2026-03-16",
    lastVisitAt: "2026-03-22T17:30:00",
    isLocked: false,
    note: "Thích món ít cay.",
    recentOrders: [
      {
        id: "OD-3188",
        date: "2026-03-22",
        total: 280000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3128",
        date: "2026-03-09",
        total: 360000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3055",
        date: "2026-02-21",
        total: 215000,
        status: "Đã thanh toán",
      },
    ],
  },
  {
    id: 9,
    name: "Hoang Trung Hieu",
    phone: "0911666777",
    tier: "diamond",
    points: 3210,
    joinedAt: "2024-03-05",
    lastVisitAt: "2026-03-23T19:25:00",
    isLocked: false,
    note: "Khách doanh nghiệp, cần hóa đơn VAT.",
    recentOrders: [
      {
        id: "OD-3192",
        date: "2026-03-23",
        total: 2300000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3111",
        date: "2026-03-04",
        total: 1740000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3009",
        date: "2026-02-14",
        total: 1520000,
        status: "Đã thanh toán",
      },
    ],
  },
  {
    id: 10,
    name: "Mai Lan Huong",
    phone: "0909000111",
    tier: "silver",
    points: 700,
    joinedAt: "2025-11-30",
    lastVisitAt: "2026-03-12T20:05:00",
    isLocked: false,
    note: "Sinh nhật tháng 4, ưu tiên gửi ưu đãi.",
    recentOrders: [
      {
        id: "OD-3141",
        date: "2026-03-12",
        total: 640000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-3060",
        date: "2026-02-23",
        total: 510000,
        status: "Đã thanh toán",
      },
      {
        id: "OD-2989",
        date: "2026-02-09",
        total: 390000,
        status: "Đã thanh toán",
      },
    ],
  },
];

const tierMap = {
  bronze: "Đồng",
  silver: "Bạc",
  gold: "Vàng",
  diamond: "Kim cương",
};

const tierBadgeClassMap = {
  bronze: "bg-amber-100 text-amber-800",
  silver: "bg-slate-100 text-slate-700",
  gold: "bg-yellow-100 text-yellow-800",
  diamond: "bg-blue-100 text-blue-700",
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const formatDate = (dateValue) => {
  const date = new Date(dateValue);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getInitials = (name) => {
  const words = name.trim().split(" ").filter(Boolean);
  if (!words.length) return "KH";
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
};

const getRelativeTime = (dateValue) => {
  const now = new Date();
  const time = new Date(dateValue);
  const diffInMs = now.getTime() - time.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return "Vừa xong";
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  if (diffInDays < 30) return `${diffInDays} ngày trước`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} tháng trước`;

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} năm trước`;
};

function CustomerStats({ totalCustomers, newCustomersInMonth }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-blue-200 bg-linear-to-br from-blue-50 to-cyan-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-blue-900">
              Tổng số khách hàng
            </CardTitle>
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <Users className="size-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-extrabold tracking-tight text-blue-900">
            {totalCustomers}
          </p>
          <p className="mt-1 text-sm text-blue-700">
            Đang lưu trong hệ thống CRM
          </p>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-linear-to-br from-emerald-50 to-lime-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-emerald-900">
              Khách hàng mới trong tháng
            </CardTitle>
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <TrendingUp className="size-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-extrabold tracking-tight text-emerald-900">
            {newCustomersInMonth}
          </p>
          <p className="mt-1 text-sm text-emerald-700">
            Đăng ký thành viên trong tháng hiện tại
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function CustomerTable({
  customers,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetail,
  onRewardPoints,
  onToggleLock,
}) {
  const renderPaginationItems = () => {
    return Array.from({ length: totalPages }, (_, index) => {
      const page = index + 1;
      return (
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            isActive={page === currentPage}
            onClick={(event) => {
              event.preventDefault();
              onPageChange(page);
            }}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Danh sách khách hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Hạng thành viên</TableHead>
              <TableHead>Điểm tích lũy</TableHead>
              <TableHead>Lần cuối đến quán</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Không có khách hàng phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-slate-100 text-slate-700">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <p className="font-medium leading-none">
                          {customer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {customer.phone}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={tierBadgeClassMap[customer.tier]}>
                      {tierMap[customer.tier]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1 font-semibold text-amber-700">
                      <Trophy className="size-4" />
                      {customer.points}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <CalendarClock className="size-4" />
                      {getRelativeTime(customer.lastVisitAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetail(customer.id)}
                      >
                        <Eye className="mr-1 size-4" />
                        Xem chi tiết
                      </Button>
                      <Button
                        size="sm"
                        disabled={customer.isLocked}
                        onClick={() => onRewardPoints(customer.id)}
                      >
                        <Gift className="mr-1 size-4" />
                        Tặng điểm thưởng
                      </Button>
                      <Button
                        size="sm"
                        variant={customer.isLocked ? "outline" : "destructive"}
                        onClick={() => onToggleLock(customer.id)}
                      >
                        {customer.isLocked ? (
                          <>
                            <LockOpen className="mr-1 size-4" />
                            Mở khoá
                          </>
                        ) : (
                          <>
                            <Lock className="mr-1 size-4" />
                            Khoá tài khoản
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {customers.length} khách hàng
          </p>
          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    onPageChange(Math.max(1, currentPage - 1));
                  }}
                />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    onPageChange(Math.min(totalPages, currentPage + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomerDetailSheet({
  customer,
  open,
  onOpenChange,
  noteDraft,
  onChangeNoteDraft,
  onSaveNote,
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Chi tiết khách hàng</SheetTitle>
          <SheetDescription>
            Xem thông tin cơ bản, đơn hàng gần nhất và cập nhật ghi chú nội bộ.
          </SheetDescription>
        </SheetHeader>

        {!customer ? (
          <div className="p-4 text-sm text-muted-foreground">
            Chưa chọn khách hàng.
          </div>
        ) : (
          <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback className="bg-slate-100 text-slate-700">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      SĐT: {customer.phone}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={tierBadgeClassMap[customer.tier]}>
                        {tierMap[customer.tier]}
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-800">
                        {customer.points} điểm
                      </Badge>
                      <Badge
                        className={
                          customer.isLocked
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }
                      >
                        {customer.isLocked ? "Đã khoá" : "Đang hoạt động"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Lịch sử đơn hàng gần nhất
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>{formatDate(order.date)}</TableCell>
                        <TableCell>
                          {currencyFormatter.format(order.total)}
                        </TableCell>
                        <TableCell>{order.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ghi chú đặc biệt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={noteDraft}
                  onChange={(event) => onChangeNoteDraft(event.target.value)}
                  placeholder="Nhập ghi chú cho khách hàng này..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Ghi chú giúp đội phục vụ cá nhân hóa trải nghiệm khách hàng.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <SheetFooter>
          <Button onClick={onSaveNote}>Lưu ghi chú</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const ManageCustomersPage = () => {
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");

  const filteredCustomers = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return customers;

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(normalized) ||
        customer.phone.toLowerCase().includes(normalized),
    );
  }, [customers, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / PAGE_SIZE),
  );

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCustomers.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredCustomers]);

  const selectedCustomer = useMemo(
    () =>
      customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  const newCustomersInMonth = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    return customers.filter((customer) => {
      const joinedDate = new Date(customer.joinedAt);
      return (
        joinedDate.getMonth() === month && joinedDate.getFullYear() === year
      );
    }).length;
  }, [customers]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (selectedCustomer) {
      setNoteDraft(selectedCustomer.note ?? "");
    }
  }, [selectedCustomer]);

  const handleViewDetail = (customerId) => {
    setSelectedCustomerId(customerId);
    setIsDetailOpen(true);
  };

  const handleRewardPoints = (customerId) => {
    // Demo logic: tặng mặc định 50 điểm thưởng cho khách hàng.
    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.id === customerId && !customer.isLocked
          ? { ...customer, points: customer.points + 50 }
          : customer,
      ),
    );
  };

  const handleToggleLock = (customerId) => {
    // Cho phép admin khoá/mở khoá tài khoản khách hàng trực tiếp trên bảng.
    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.id === customerId
          ? { ...customer, isLocked: !customer.isLocked }
          : customer,
      ),
    );
  };

  const handleSaveNote = () => {
    if (!selectedCustomerId) return;

    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.id === selectedCustomerId
          ? { ...customer, note: noteDraft.trim() }
          : customer,
      ),
    );
  };

  return (
    <section className="space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Quản lý khách hàng
        </h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi thành viên, điểm thưởng và lịch sử ghé quán của khách hàng.
        </p>
      </div>

      <CustomerStats
        totalCustomers={customers.length}
        newCustomersInMonth={newCustomersInMonth}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên khách hàng hoặc số điện thoại"
              className="h-11 border-2 border-blue-200 pl-9 focus-visible:border-blue-400"
            />
          </div>
        </CardContent>
      </Card>

      <CustomerTable
        customers={paginatedCustomers}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onViewDetail={handleViewDetail}
        onRewardPoints={handleRewardPoints}
        onToggleLock={handleToggleLock}
      />

      <CustomerDetailSheet
        customer={selectedCustomer}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        noteDraft={noteDraft}
        onChangeNoteDraft={setNoteDraft}
        onSaveNote={handleSaveNote}
      />
    </section>
  );
};

export default ManageCustomersPage;
