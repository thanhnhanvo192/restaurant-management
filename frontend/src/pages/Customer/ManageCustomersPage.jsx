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
import api from "@/lib/axios";

const PAGE_SIZE = 5;

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

const getInitials = (name = "") => {
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
            <div className="p-2 text-blue-700 bg-blue-100 rounded-xl">
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
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
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

        <div className="flex flex-col gap-3 pt-4 border-t sm:flex-row sm:items-center sm:justify-between">
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
          <div className="flex-1 px-4 pb-4 space-y-5 overflow-y-auto">
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
  const [customers, setCustomers] = useState([{}]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/admin/customers");
      setCustomers(res.data.customers);
      console.log(customers);
    } catch (error) {
      console.error("Lỗi khi tải danh sách khách hàng:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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
    <section className="p-4 space-y-6 md:p-6">
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
            <Search className="absolute -translate-y-1/2 pointer-events-none top-1/2 left-3 size-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên khách hàng hoặc số điện thoại"
              className="border-2 border-blue-200 h-11 pl-9 focus-visible:border-blue-400"
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
