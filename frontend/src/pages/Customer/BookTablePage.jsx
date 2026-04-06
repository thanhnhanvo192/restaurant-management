import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Clock3, Users, UtensilsCrossed } from "lucide-react";

const INITIAL_TABLES = [
  { id: "B01", floor: "ground", seats: 2, status: "available" },
  { id: "B02", floor: "ground", seats: 4, status: "reserved" },
  { id: "B03", floor: "ground", seats: 6, status: "serving" },
  { id: "B04", floor: "ground", seats: 4, status: "available" },
  { id: "B05", floor: "ground", seats: 2, status: "available" },
  { id: "B06", floor: "floor1", seats: 4, status: "available" },
  { id: "B07", floor: "floor1", seats: 6, status: "reserved" },
  { id: "B08", floor: "floor1", seats: 8, status: "available" },
  { id: "B09", floor: "floor1", seats: 2, status: "serving" },
  { id: "B10", floor: "floor1", seats: 4, status: "available" },
  { id: "B11", floor: "vip", seats: 6, status: "available" },
  { id: "B12", floor: "vip", seats: 10, status: "reserved" },
  { id: "B13", floor: "vip", seats: 8, status: "available" },
  { id: "B14", floor: "vip", seats: 12, status: "serving" },
  { id: "B15", floor: "vip", seats: 6, status: "available" },
];

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
      "border-2 border-emerald-400 bg-white hover:border-emerald-500 hover:shadow-emerald-100",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  reserved: {
    label: "Đã đặt trước",
    cardClass:
      "border-2 border-slate-300 bg-slate-100 hover:border-slate-400 hover:shadow-slate-200",
    badgeClass: "bg-slate-200 text-slate-700",
  },
  serving: {
    label: "Đang phục vụ",
    cardClass:
      "border-2 border-rose-300 bg-rose-100 hover:border-rose-400 hover:shadow-rose-200",
    badgeClass: "bg-rose-200 text-rose-700",
  },
};

export default function BookTablePage() {
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [activeFloor, setActiveFloor] = useState("all");
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const openBookingDialog = (tableId) => {
    setSelectedTableId(tableId);
    setIsDialogOpen(true);
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

    // Demo logic: sau khi xác nhận thì chuyển trạng thái bàn sang Đã đặt trước
    setTables((prev) =>
      prev.map((table) =>
        table.id === selectedTable.id
          ? { ...table, status: "reserved" }
          : table,
      ),
    );

    toast.success(`Đặt thành công bàn ${selectedTable.id} lúc ${bookingTime}`);
    closeDialog();
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header trang */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Đặt bàn
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Chọn bàn phù hợp và đặt trước dễ dàng
        </p>
      </section>

      {/* Tabs chọn tầng */}
      <Tabs value={activeFloor} onValueChange={setActiveFloor}>
        <TabsList className="h-auto rounded-2xl bg-orange-50/80 p-1">
          <TabsTrigger
            value="all"
            className="rounded-xl px-4 py-2 data-active:bg-orange-500 data-active:text-white"
          >
            Tất cả ({floorCount.all})
          </TabsTrigger>
          <TabsTrigger
            value="ground"
            className="rounded-xl px-4 py-2 data-active:bg-orange-500 data-active:text-white"
          >
            Tầng trệt ({floorCount.ground})
          </TabsTrigger>
          <TabsTrigger
            value="floor1"
            className="rounded-xl px-4 py-2 data-active:bg-orange-500 data-active:text-white"
          >
            Lầu 1 ({floorCount.floor1})
          </TabsTrigger>
          <TabsTrigger
            value="vip"
            className="rounded-xl px-4 py-2 data-active:bg-orange-500 data-active:text-white"
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
        {visibleTables.map((table) => {
          const status = statusMap[table.status];

          return (
            <Card
              key={table.id}
              role="button"
              tabIndex={0}
              onClick={() => openBookingDialog(table.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openBookingDialog(table.id);
                }
              }}
              className={[
                "aspect-square cursor-pointer rounded-2xl transition-all duration-200",
                "hover:-translate-y-1 hover:shadow-lg",
                status.cardClass,
              ].join(" ")}
            >
              <CardContent className="flex h-full flex-col justify-between p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <Badge className={status.badgeClass}>{status.label}</Badge>
                  <UtensilsCrossed className="h-4 w-4 text-orange-500" />
                </div>

                <div className="space-y-1 text-center">
                  <p className="text-lg font-bold text-foreground md:text-xl">
                    Bàn {table.id.replace("B", "")}
                  </p>
                  <p className="inline-flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {table.seats} chỗ
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Dialog xác nhận đặt bàn */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border-orange-100">
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
                <CalendarDays className="h-4 w-4 text-orange-500" />
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
                <Clock3 className="h-4 w-4 text-orange-500" />
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
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
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
              className="h-11 rounded-full bg-orange-500 px-6 text-white hover:bg-orange-600"
              onClick={handleConfirmBooking}
            >
              Xác nhận đặt bàn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
