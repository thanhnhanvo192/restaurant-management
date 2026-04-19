import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CreditCard,
  Download,
  Mail,
  Phone,
  Printer,
  Search,
  Smartphone,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  endOfDay,
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";
import { vi } from "date-fns/locale";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import api from "@/services/api/client";

const PAGE_SIZE = 6;
const VAT_RATE = 0.08;

const PAYMENT_METHODS = {
  cash: "Tiền mặt",
  transfer: "Chuyển khoản",
  card: "Thẻ",
};

const STATUS_LABELS = {
  pending: "Đang chờ",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  completed: "Hoàn thành",
  canceled: "Đã hủy",
};

const STATUS_CLASS_MAP = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-sky-100 text-sky-700",
  preparing: "bg-indigo-100 text-indigo-700",
  completed: "bg-emerald-100 text-emerald-700",
  canceled: "bg-red-100 text-red-700",
};

const PAYMENT_ICON_MAP = {
  cash: Banknote,
  transfer: Smartphone,
  card: CreditCard,
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const toInvoiceWithTotals = (invoice) => {
  const subtotalFromItems = (invoice.items || []).reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const subtotal = Number(invoice.subtotal ?? subtotalFromItems);
  const vat = Number(invoice.vat ?? Math.round(subtotal * VAT_RATE));
  const total = subtotal + vat;

  return {
    ...invoice,
    subtotal,
    vat,
    total,
  };
};

const toInvoiceViewModel = (order) => {
  const rawId = order.orderCode || order.id || order._id || "";
  const orderId = String(rawId);

  return {
    id: orderId,
    tableLabel: order.tableId ? `Bàn ${order.tableId}` : "Mang về",
    customer: {
      ten: order.customerSnapshot?.name || "Khách lẻ",
      sdt: order.customerSnapshot?.phone || "Không có SĐT",
      email: order.customerSnapshot?.email || "",
    },
    items: Array.isArray(order.items) ? order.items : [],
    paymentMethod: order.paymentMethod || "cash",
    status: order.status || "pending",
    createdAt: order.createdAt,
    subtotal: Number(order.subtotal || 0),
    vat: Number(order.taxAmount || 0),
    totalAmount: Number(order.totalAmount || 0),
  };
};

function InvoiceToolbar({
  searchTerm,
  onSearchTermChange,
  dateRange,
  onDateRangeChange,
  paymentFilter,
  onPaymentFilterChange,
  onExportExcel,
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-3 md:grid-cols-2 xl:flex xl:items-center">
            <div className="relative md:w-full xl:w-80">
              <Search className="absolute -translate-y-1/2 pointer-events-none top-1/2 left-3 size-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => onSearchTermChange(event.target.value)}
                placeholder="Tìm mã hóa đơn hoặc số bàn"
                className="pl-9"
              />
            </div>

            <DateRangePicker value={dateRange} onChange={onDateRangeChange} />

            <Select value={paymentFilter} onValueChange={onPaymentFilterChange}>
              <SelectTrigger className="w-full md:w-55">
                <SelectValue placeholder="Lọc phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phương thức</SelectItem>
                <SelectItem value="cash">Tiền mặt</SelectItem>
                <SelectItem value="transfer">Chuyển khoản</SelectItem>
                <SelectItem value="card">Thẻ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onExportExcel} className="w-full xl:w-auto">
            <Download className="mr-2 size-4" />
            Xuất Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InvoiceTable({
  invoices,
  currentPage,
  totalPages,
  onPageChange,
  onRowClick,
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
        <CardTitle className="text-lg">Danh sách hóa đơn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã HD</TableHead>
              <TableHead>Bàn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead>Phương thức</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  Không có hóa đơn phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => {
                const PaymentIcon = PAYMENT_ICON_MAP[invoice.paymentMethod];

                return (
                  <TableRow
                    key={invoice.id}
                    onClick={() => onRowClick(invoice.id)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <span className="font-mono font-semibold">
                        {invoice.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {invoice.tableLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-medium">{invoice.customer.ten}</p>
                        <p className="text-xs text-muted-foreground">
                          {invoice.customer.sdt}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-right text-slate-900">
                      {currencyFormatter.format(invoice.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <PaymentIcon className="size-4 text-muted-foreground" />
                        {PAYMENT_METHODS[invoice.paymentMethod]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_CLASS_MAP[invoice.status]}>
                        {STATUS_LABELS[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p>
                          {format(
                            parseISO(invoice.createdAt),
                            "dd/MM/yyyy HH:mm",
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(parseISO(invoice.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 pt-4 border-t sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {invoices.length} hóa đơn
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

function InvoiceDetailDialog({ invoice, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        {!invoice ? null : (
          <>
            <DialogHeader>
              <DialogTitle className="font-mono text-lg">
                {invoice.id}
              </DialogTitle>
              <DialogDescription>
                {format(parseISO(invoice.createdAt), "dd/MM/yyyy HH:mm")} |{" "}
                {invoice.tableLabel}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-2 p-4 text-sm border rounded-lg bg-muted/20">
                <p className="font-semibold">Thông tin người đặt</p>
                <div className="flex items-center gap-2">
                  <UserRound className="size-4 text-muted-foreground" />
                  <span>{invoice.customer.ten}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  <span>{invoice.customer.sdt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <span>{invoice.customer.email || "Không có email"}</span>
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên món</TableHead>
                      <TableHead className="text-center">Số lượng</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.map((item) => {
                      const lineTotal = item.quantity * item.unitPrice;
                      return (
                        <TableRow key={`${invoice.id}-${item.name}`}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-center">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {currencyFormatter.format(item.unitPrice)}
                          </TableCell>
                          <TableCell className="font-medium text-right">
                            {currencyFormatter.format(lineTotal)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="w-full max-w-sm p-4 ml-auto space-y-2 border rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-medium">
                    {currencyFormatter.format(invoice.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">VAT (8%)</span>
                  <span className="font-medium">
                    {currencyFormatter.format(invoice.vat)}
                  </span>
                </div>
                <div className="pt-2 border-t" />
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">Tổng cộng</span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {currencyFormatter.format(invoice.total)}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline">
                <Printer className="mr-2 size-4" />
                In lại
              </Button>
              <DialogClose asChild>
                <Button variant="default">Đóng</Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const ManageInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await api.get("/admin/orders");
      const nextInvoices = (res.data?.orders || [])
        .map(toInvoiceViewModel)
        .map(toInvoiceWithTotals);
      setInvoices(nextInvoices);
    } catch (error) {
      toast.error("Lỗi khi tải hóa đơn");
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return invoices.filter((invoice) => {
      // Hỗ trợ tìm kiếm theo mã HD, bàn, tên khách hàng hoặc số điện thoại.
      const matchesSearch =
        normalizedSearch.length === 0 ||
        String(invoice.id || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(invoice.tableLabel || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(invoice.customer?.ten || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(invoice.customer?.sdt || "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesPayment =
        paymentFilter === "all" || invoice.paymentMethod === paymentFilter;

      const invoiceDate = parseISO(invoice.createdAt);

      const hasFrom = Boolean(dateRange.from);
      const hasTo = Boolean(dateRange.to);

      const fromDate = hasFrom ? startOfDay(parseISO(dateRange.from)) : null;
      const toDate = hasTo ? endOfDay(parseISO(dateRange.to)) : null;

      const matchesFrom = !fromDate || !isBefore(invoiceDate, fromDate);
      const matchesTo = !toDate || !isAfter(invoiceDate, toDate);

      return matchesSearch && matchesPayment && matchesFrom && matchesTo;
    });
  }, [dateRange.from, dateRange.to, invoices, paymentFilter, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / PAGE_SIZE),
  );

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredInvoices.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredInvoices]);

  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null,
    [invoices, selectedInvoiceId],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleExportExcel = () => {
    // Mock action: thực tế sẽ gọi API export file excel.
    window.alert("Đã tạo file xuất Excel (mô phỏng).");
  };

  const handleOpenDetail = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = (open) => {
    setIsDetailOpen(open);
    if (!open) {
      setSelectedInvoiceId(null);
    }
  };

  return (
    <section className="p-4 space-y-6 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Quản lý hóa đơn
        </h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi lịch sử thanh toán cho vai trò Quản trị viên và Nhân viên.
        </p>
      </div>

      <InvoiceToolbar
        searchTerm={searchTerm}
        onSearchTermChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        dateRange={dateRange}
        onDateRangeChange={(nextRange) => {
          setDateRange(nextRange);
          setCurrentPage(1);
        }}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={(value) => {
          setPaymentFilter(value);
          setCurrentPage(1);
        }}
        onExportExcel={handleExportExcel}
      />

      <InvoiceTable
        invoices={paginatedInvoices}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onRowClick={handleOpenDetail}
      />

      <InvoiceDetailDialog
        invoice={selectedInvoice}
        open={isDetailOpen}
        onOpenChange={handleCloseDetail}
      />
    </section>
  );
};

export default ManageInvoicesPage;
