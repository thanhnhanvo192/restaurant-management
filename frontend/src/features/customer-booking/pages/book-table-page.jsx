import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";
import { CalendarDays, Clock3, Users, UtensilsCrossed } from "lucide-react";
import api from "@/services/api/client";
import { getCustomerAuthHeaders } from "@/services/customer-session";

const TIME_OPTIONS = [
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
];

const statusMap = {
  available: {
    label: "Trống",
    cardClass:
      "border-2 border-sky-200 bg-white hover:border-[hsl(var(--customer-primary))] hover:shadow-[hsl(var(--customer-primary)/0.12)]",
    badgeClass: "bg-sky-100 text-sky-700",
  },
  reserved: {
    label: "Đã đặt trước",
    cardClass:
      "border-2 border-slate-200 bg-slate-50 hover:border-slate-300 hover:shadow-slate-100",
    badgeClass: "bg-slate-100 text-slate-700",
  },
  serving: {
    label: "Đang phục vụ",
    cardClass:
      "border-2 border-cyan-200 bg-cyan-50 hover:border-cyan-300 hover:shadow-cyan-100",
    badgeClass: "bg-cyan-100 text-cyan-700",
  },
};

const fallbackStatus = {
  label: "Không khả dụng",
  cardClass: "border-2 border-sky-200 bg-sky-50",
  badgeClass: "bg-sky-100 text-sky-700",
};

export default function BookTablePage() {
  const [tables, setTables] = useState([]);
  const [activeFloor, setActiveFloor] = useState("all");
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state trong dialog đặt bàn
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [specialNote, setSpecialNote] = useState("");

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [selectedTableId, tables],
  );

  const visibleTables = useMemo(() => {
    if (activeFloor === "all") {
      return tables;
    }

    return tables.filter((table) => table.floor === activeFloor);
  }, [activeFloor, tables]);

  const floorCount = useMemo(
    () => ({
      all: tables.length,
      ground: tables.filter((t) => t.floor === "ground").length,
      floor1: tables.filter((t) => t.floor === "floor1").length,
      vip: tables.filter((t) => t.floor === "vip").length,
    }),
    [tables],
  );

  useEffect(() => {
    const loadTables = async () => {
      try {
        const response = await api.get("/client/tables");
        const data = response.data?.tables || [];
        setTables(data);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Không thể tải danh sách bàn",
        );
      } finally {
        setLoading(false);
      }
    };

    loadTables();
  }, []);

  const openBookingDialog = (tableId) => {
    setSelectedTableId(tableId);
    setIsDialogOpen(true);
  };

  const handleTableSelect = (table) => {
    if (table.status !== "available") {
      toast.error("Bàn này hiện không thể đặt, vui lòng chọn bàn khác.");
      return;
    }

    openBookingDialog(table.id);
  };

  const resetBookingForm = () => {
    setBookingDate("");
    setBookingTime("");
    setGuestCount(2);
    setSpecialNote("");
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedTableId(null);
    resetBookingForm();
  };

  const handleConfirmBooking = () => {
    if (!selectedTable) {
      return;
    }

    if (selectedTable.status !== "available") {
      toast.error("Bàn này không còn trống, vui lòng chọn bàn khác.");
      return;
    }

    if (!bookingDate || !bookingTime) {
      toast.error("Vui lòng chọn ngày và giờ đặt bàn.");
      return;
    }

    if (guestCount < 1 || guestCount > 12) {
      toast.error("Số người hợp lệ từ 1 đến 12.");
      return;
    }

    if (guestCount > selectedTable.seats) {
      toast.error(
        `Bàn ${selectedTable.id} chỉ phù hợp tối đa ${selectedTable.seats} người.`,
      );
      return;
    }

    const submitBooking = async () => {
      try {
        setSubmitting(true);
        const response = await api.post(
          "/client/bookings",
          {
            tableId: selectedTable.id,
            bookingDate,
            bookingTime,
            guestCount,
            specialNote,
          },
          {
            headers: getCustomerAuthHeaders(),
          },
        );

        toast.success(
          response.data?.message ||
            `Đặt thành công bàn ${selectedTable.tableNumber}`,
        );
        setTables((prev) =>
          prev.map((table) =>
            table.id === selectedTable.id
              ? { ...table, status: "reserved", isAvailable: false }
              : table,
          ),
        );
        closeDialog();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Không thể đặt bàn");
      } finally {
        setSubmitting(false);
      }
    };

    if (!getCustomerAuthHeaders().Authorization) {
      toast.error("Vui lòng đăng nhập để đặt bàn");
      return;
    }

    submitBooking();
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header trang */}
      <section className="overflow-hidden rounded-3xl border border-[hsl(var(--customer-border))] bg-white shadow-sm">
        <div className="bg-linear-to-r from-[hsl(var(--customer-primary))] to-[hsl(var(--customer-bg))] p-5 text-white md:p-6">
          <Badge className="bg-white/20 text-white hover:bg-white/20">
            Đặt bàn thông minh
          </Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Chọn bàn theo nhu cầu của bạn
          </h1>
          <p className="mt-2 text-sm text-white/90 md:text-base">
            Lọc theo khu vực, xem trạng thái theo thời gian thực và xác nhận đặt
            bàn chỉ trong vài bước.
          </p>
        </div>

        <div className="grid gap-3 border-t border-[hsl(var(--customer-border))] bg-[hsl(var(--customer-surface-soft)/0.5)] p-4 text-sm text-[hsl(var(--customer-text-accent))] sm:grid-cols-3">
          <div className="rounded-2xl bg-white px-3 py-2">
            Bàn trống: <span className="font-semibold">{floorCount.all}</span>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2">
            Khu VIP: <span className="font-semibold">{floorCount.vip}</span>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2">
            Đặt nhanh trong ngày
          </div>
        </div>
      </section>

      {/* Tabs chọn tầng */}
      <Tabs value={activeFloor} onValueChange={setActiveFloor}>
        <TabsList className="h-auto rounded-2xl bg-[hsl(var(--customer-surface-soft)/0.8)] p-1">
          <TabsTrigger
            value="all"
            className="rounded-xl px-4 py-2 data-active:bg-[hsl(var(--customer-primary))] data-active:text-white"
          >
            Tất cả ({floorCount.all})
          </TabsTrigger>
          <TabsTrigger
            value="ground"
            className="rounded-xl px-4 py-2 data-active:bg-[hsl(var(--customer-primary))] data-active:text-white"
          >
            Tầng trệt ({floorCount.ground})
          </TabsTrigger>
          <TabsTrigger
            value="floor1"
            className="rounded-xl px-4 py-2 data-active:bg-[hsl(var(--customer-primary))] data-active:text-white"
          >
            Lầu 1 ({floorCount.floor1})
          </TabsTrigger>
          <TabsTrigger
            value="vip"
            className="rounded-xl px-4 py-2 data-active:bg-[hsl(var(--customer-primary))] data-active:text-white"
          >
            VIP ({floorCount.vip})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Chú thích trạng thái */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Badge className="bg-emerald-100 text-emerald-700">Trống</Badge>
        <Badge className="bg-slate-200 text-slate-700">Đã đặt trước</Badge>
        <Badge className="bg-rose-200 text-rose-700">Đang phục vụ</Badge>
      </div>

      {/* Sơ đồ bàn */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5">
        {loading ? (
          <div className="col-span-full rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Đang tải bàn...
          </div>
        ) : (
          visibleTables.map((table) => {
            const status = statusMap[table.status] ?? fallbackStatus;
            const isBookable = table.status === "available";

            return (
              <Card
                key={table.id}
                role="button"
                tabIndex={isBookable ? 0 : -1}
                onClick={() => handleTableSelect(table)}
                onKeyDown={(event) => {
                  if (!isBookable) {
                    return;
                  }

                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleTableSelect(table);
                  }
                }}
                className={[
                  "aspect-square rounded-2xl transition-all duration-200",
                  isBookable
                    ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg"
                    : "cursor-not-allowed opacity-90",
                  status.cardClass,
                ].join(" ")}
              >
                <CardContent className="flex h-full flex-col justify-between p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <Badge className={status.badgeClass}>{status.label}</Badge>
                    <UtensilsCrossed className="h-4 w-4 text-[hsl(var(--customer-primary))]" />
                  </div>

                  <div className="space-y-1 text-center">
                    <p className="text-lg font-bold text-foreground md:text-xl">
                      Bàn {table.tableNumber || table.id}
                    </p>
                    <p className="inline-flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {table.seats || table.capacity} chỗ
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </section>

      {/* Dialog xác nhận đặt bàn */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border-[hsl(var(--customer-border))]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Xác nhận đặt bàn {selectedTable ? selectedTable.id : ""}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin để hoàn tất đặt bàn nhanh chóng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* DatePicker: dùng input type=date để đảm bảo chạy tốt trong mọi trình duyệt */}
            <div className="space-y-2">
              <Label
                htmlFor="booking-date"
                className="inline-flex items-center gap-2"
              >
                <CalendarDays className="h-4 w-4 text-[hsl(var(--customer-primary))]" />
                Chọn ngày đặt (DatePicker)
              </Label>
              <Input
                id="booking-date"
                type="date"
                value={bookingDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(event) => setBookingDate(event.target.value)}
              />
            </div>

            {/* TimePicker */}
            <div className="space-y-2">
              <Label
                htmlFor="booking-time"
                className="inline-flex items-center gap-2"
              >
                <Clock3 className="h-4 w-4 text-[hsl(var(--customer-primary))]" />
                Chọn giờ (TimePicker)
              </Label>
              <Select value={bookingTime} onValueChange={setBookingTime}>
                <SelectTrigger id="booking-time">
                  <SelectValue placeholder="Chọn khung giờ" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Input number số người */}
            <div className="space-y-2">
              <Label htmlFor="guest-count">Số người (1 - 12)</Label>
              <Input
                id="guest-count"
                type="number"
                min={1}
                max={12}
                value={guestCount}
                onChange={(event) =>
                  setGuestCount(Number(event.target.value || 1))
                }
              />
            </div>

            {/* Ghi chú đặc biệt */}
            <div className="space-y-2">
              <Label htmlFor="special-note">Ghi chú đặc biệt</Label>
              <Textarea
                id="special-note"
                rows={4}
                placeholder="Ví dụ: Sinh nhật, Không cay, Ngồi ngoài trời..."
                value={specialNote}
                onChange={(event) => setSpecialNote(event.target.value)}
              />
            </div>

            {selectedTable ? (
              <div className="rounded-xl border border-[hsl(var(--customer-border))] bg-[hsl(var(--customer-surface-soft))] p-3 text-sm text-[hsl(var(--customer-text-accent))]">
                Bàn {selectedTable.id} phù hợp tối đa {selectedTable.seats}{" "}
                khách.
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Hủy
            </Button>
            <Button
              className="h-11 rounded-full bg-[hsl(var(--customer-primary))] px-6 text-white hover:bg-[hsl(var(--customer-primary-hover))]"
              onClick={handleConfirmBooking}
              disabled={submitting}
            >
              {submitting ? "Đang đặt..." : "Xác nhận đặt bàn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
