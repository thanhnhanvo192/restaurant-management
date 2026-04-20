import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
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
import { Label } from "@/shared/components/ui/label";
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

const statusLabels = {
  active: "Đang hoạt động",
  inactive: "Tạm dừng",
  discontinued: "Ngừng sử dụng",
};

const typeLabels = {
  ingredient: "Nguyên liệu",
  package: "Hàng đóng gói",
};

const unitOptions = ["kg", "g", "l", "ml", "pcs", "pack", "bottle", "box"];

const itemSchema = z.object({
  itemCode: z.string().trim().min(2, "Mã hàng tối thiểu 2 ký tự").max(32),
  name: z.string().trim().min(2, "Tên hàng tối thiểu 2 ký tự").max(120),
  type: z.enum(["ingredient", "package"]),
  unit: z.enum(["kg", "g", "l", "ml", "pcs", "pack", "bottle", "box"]),
  quantityOnHand: z.coerce.number().min(0, "Tồn kho phải là số không âm"),
  reorderLevel: z.coerce.number().min(0, "Mức cảnh báo phải là số không âm"),
  status: z.enum(["active", "inactive", "discontinued"]),
  supplierName: z.string().max(120).optional(),
  supplierContact: z.string().max(120).optional(),
  note: z.string().max(300).optional(),
});

const stockSchema = z.object({
  action: z.enum(["in", "out", "adjust"]),
  quantity: z.coerce.number().positive("Số lượng phải lớn hơn 0"),
  reason: z.string().trim().min(3, "Lý do tối thiểu 3 ký tự").max(200),
  note: z.string().max(300).optional(),
});

const defaultItemValues = {
  itemCode: "",
  name: "",
  type: "ingredient",
  unit: "pcs",
  quantityOnHand: 0,
  reorderLevel: 0,
  status: "active",
  supplierName: "",
  supplierContact: "",
  note: "",
};

const defaultStockValues = {
  action: "in",
  quantity: 1,
  reason: "",
  note: "",
};

const getErrorMessage = (error, fallback) => {
  const details = error?.response?.data?.error?.details;
  if (Array.isArray(details) && details[0]?.message) {
    return details[0].message;
  }

  return error?.response?.data?.message || error?.message || fallback;
};

export default function InventoryPage() {
  const [inventories, setInventories] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);

  const itemForm = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: defaultItemValues,
  });

  const stockForm = useForm({
    resolver: zodResolver(stockSchema),
    defaultValues: defaultStockValues,
  });

  const fetchInventories = useCallback(async () => {
    const response = await api.get("/admin/inventories", {
      params: {
        page: 1,
        limit: 100,
        keyword: keyword.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        type: typeFilter === "all" ? undefined : typeFilter,
        lowStockOnly: lowStockOnly ? "true" : undefined,
      },
    });

    return Array.isArray(response.data?.inventories)
      ? response.data.inventories
      : [];
  }, [keyword, lowStockOnly, statusFilter, typeFilter]);

  const fetchMovements = useCallback(async () => {
    const response = await api.get("/admin/inventories/movements", {
      params: {
        page: 1,
        limit: 30,
      },
    });

    return Array.isArray(response.data?.movements)
      ? response.data.movements
      : [];
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [nextInventories, nextMovements] = await Promise.all([
        fetchInventories(),
        fetchMovements(),
      ]);

      setInventories(nextInventories);
      setMovements(nextMovements);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải dữ liệu kho"));
    } finally {
      setLoading(false);
    }
  }, [fetchInventories, fetchMovements]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const lowStockCount = useMemo(
    () => inventories.filter((inventory) => inventory.isLowStock).length,
    [inventories],
  );

  const openCreateDialog = () => {
    setEditingId(null);
    itemForm.reset(defaultItemValues);
    setDialogOpen(true);
  };

  const openEditDialog = (inventory) => {
    setEditingId(inventory.id);
    itemForm.reset({
      itemCode: inventory.itemCode,
      name: inventory.name,
      type: inventory.type,
      unit: inventory.unit,
      quantityOnHand: Number(inventory.quantityOnHand || 0),
      reorderLevel: Number(inventory.reorderLevel || 0),
      status: inventory.status,
      supplierName: inventory.supplierName || "",
      supplierContact: inventory.supplierContact || "",
      note: inventory.note || "",
    });
    setDialogOpen(true);
  };

  const openStockDialog = (inventory, action) => {
    setSelectedInventory(inventory);
    stockForm.reset({
      action,
      quantity: 1,
      reason: "",
      note: "",
    });
    setStockDialogOpen(true);
  };

  const handleSubmitItem = async (values) => {
    try {
      setSubmitting(true);

      const payload = {
        ...values,
        supplierName: values.supplierName?.trim() || "",
        supplierContact: values.supplierContact?.trim() || "",
        note: values.note?.trim() || "",
      };

      if (editingId) {
        const response = await api.put(
          `/admin/inventories/${editingId}`,
          payload,
        );
        const updated = response.data?.inventory;
        setInventories((previous) =>
          previous.map((item) =>
            item.id === editingId ? updated || item : item,
          ),
        );
        toast.success("Cập nhật mặt hàng kho thành công");
      } else {
        const response = await api.post("/admin/inventories", payload);
        const created = response.data?.inventory;
        setInventories((previous) =>
          created ? [created, ...previous] : previous,
        );
        toast.success("Tạo mặt hàng kho thành công");
      }

      setDialogOpen(false);
      itemForm.reset(defaultItemValues);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể lưu mặt hàng kho"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInventory = async (inventoryId) => {
    if (!window.confirm("Bạn có chắc muốn xóa mặt hàng kho này?")) {
      return;
    }

    try {
      await api.delete(`/admin/inventories/${inventoryId}`);
      setInventories((previous) =>
        previous.filter((item) => item.id !== inventoryId),
      );
      toast.success("Đã xóa mặt hàng kho");
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa mặt hàng kho"));
    }
  };

  const handleSubmitStock = async (values) => {
    if (!selectedInventory?.id) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.patch(
        `/admin/inventories/${selectedInventory.id}/stock`,
        values,
      );

      const updatedInventory = response.data?.inventory;
      const movement = response.data?.movement;

      setInventories((previous) =>
        previous.map((item) =>
          item.id === selectedInventory.id ? updatedInventory || item : item,
        ),
      );

      if (movement) {
        setMovements((previous) => [movement, ...previous].slice(0, 30));
      }

      toast.success("Cập nhật tồn kho thành công");
      setStockDialogOpen(false);
      setSelectedInventory(null);
      stockForm.reset(defaultStockValues);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể cập nhật tồn kho"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRollbackMovement = async (movementId) => {
    try {
      const response = await api.post(
        `/admin/inventories/movements/${movementId}/rollback`,
        {
          reason: "Rollback bởi quản lý kho",
        },
      );

      const updatedInventory = response.data?.inventory;
      const rollbackMovement = response.data?.movement;

      if (updatedInventory?.id) {
        setInventories((previous) =>
          previous.map((item) =>
            item.id === updatedInventory.id ? updatedInventory : item,
          ),
        );
      }

      if (rollbackMovement) {
        setMovements((previous) =>
          [rollbackMovement, ...previous].slice(0, 30),
        );
      }

      setMovements((previous) =>
        previous.map((movement) =>
          movement.id === movementId
            ? {
                ...movement,
                rolledBackAt: new Date().toISOString(),
              }
            : movement,
        ),
      );

      toast.success("Rollback giao dịch kho thành công");
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể rollback giao dịch kho"));
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Quản lý kho
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Quản lý tồn kho, lịch sử biến động và cảnh báo sắp hết hàng.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="mr-2 size-4" />
              Tải lại
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 size-4" />
              Thêm mặt hàng
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng mặt hàng</CardDescription>
            <CardTitle className="text-2xl">{inventories.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">
              <Boxes className="mr-1 size-4" /> Kho hiện tại
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sắp hết hàng</CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              {lowStockCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
              <AlertTriangle className="mr-1 size-4" /> Cần nhập thêm
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Danh sách mặt hàng kho</CardTitle>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Tìm theo mã, tên, nhà cung cấp"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Tạm dừng</SelectItem>
                <SelectItem value="discontinued">Ngừng sử dụng</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Loại hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại hàng</SelectItem>
                <SelectItem value="ingredient">Nguyên liệu</SelectItem>
                <SelectItem value="package">Hàng đóng gói</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant={lowStockOnly ? "default" : "outline"}
              onClick={() => setLowStockOnly((previous) => !previous)}
            >
              <AlertTriangle className="mr-2 size-4" />
              Chỉ hàng sắp hết
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Đang tải dữ liệu kho...
            </p>
          ) : inventories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã hàng</TableHead>
                  <TableHead>Tên hàng</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Ngưỡng cảnh báo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventories.map((inventory) => (
                  <TableRow key={inventory.id}>
                    <TableCell className="font-medium">
                      {inventory.itemCode}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{inventory.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {inventory.unit} •{" "}
                          {inventory.supplierName || "Chưa có NCC"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {typeLabels[inventory.type] || inventory.type}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          inventory.isLowStock
                            ? "font-semibold text-orange-600"
                            : "font-medium"
                        }
                      >
                        {inventory.quantityOnHand}
                      </span>
                    </TableCell>
                    <TableCell>{inventory.reorderLevel}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {statusLabels[inventory.status] || inventory.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openStockDialog(inventory, "in")}
                        >
                          <ArrowDownToLine className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openStockDialog(inventory, "out")}
                        >
                          <ArrowUpFromLine className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(inventory)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteInventory(inventory.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có dữ liệu kho phù hợp bộ lọc.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử biến động kho</CardTitle>
          <CardDescription>
            Theo dõi thao tác nhập, xuất, điều chỉnh và rollback gần nhất.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {movements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Mặt hàng</TableHead>
                  <TableHead>Loại giao dịch</TableHead>
                  <TableHead>Biến động</TableHead>
                  <TableHead>Trước / Sau</TableHead>
                  <TableHead>Người thao tác</TableHead>
                  <TableHead className="text-right">Rollback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {new Date(movement.createdAt).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      {movement.inventory?.name || movement.inventoryId || "-"}
                    </TableCell>
                    <TableCell>{movement.type}</TableCell>
                    <TableCell
                      className={
                        Number(movement.quantityDelta) > 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }
                    >
                      {Number(movement.quantityDelta) > 0 ? "+" : ""}
                      {movement.quantityDelta}
                    </TableCell>
                    <TableCell>
                      {movement.quantityBefore} → {movement.quantityAfter}
                    </TableCell>
                    <TableCell>
                      {movement.performedBy?.fullName || "Hệ thống"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        {movement.type !== "rollback" &&
                        !movement.rolledBackAt ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRollbackMovement(movement.id)}
                          >
                            <RotateCcw className="mr-2 size-4" /> Rollback
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Đã rollback
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có lịch sử biến động.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Cập nhật mặt hàng" : "Thêm mặt hàng"}
            </DialogTitle>
            <DialogDescription>
              Nhập đầy đủ thông tin để theo dõi tồn kho và cảnh báo.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={itemForm.handleSubmit(handleSubmitItem)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="itemCode">Mã hàng</Label>
                <Input id="itemCode" {...itemForm.register("itemCode")} />
                {itemForm.formState.errors.itemCode ? (
                  <p className="text-xs text-destructive">
                    {itemForm.formState.errors.itemCode.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Tên hàng</Label>
                <Input id="name" {...itemForm.register("name")} />
                {itemForm.formState.errors.name ? (
                  <p className="text-xs text-destructive">
                    {itemForm.formState.errors.name.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Loại</Label>
                <Select
                  value={itemForm.watch("type")}
                  onValueChange={(value) => itemForm.setValue("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingredient">Nguyên liệu</SelectItem>
                    <SelectItem value="package">Hàng đóng gói</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Đơn vị</Label>
                <Select
                  value={itemForm.watch("unit")}
                  onValueChange={(value) => itemForm.setValue("unit", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={itemForm.watch("status")}
                  onValueChange={(value) => itemForm.setValue("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Tạm dừng</SelectItem>
                    <SelectItem value="discontinued">Ngừng sử dụng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantityOnHand">Tồn kho</Label>
                <Input
                  id="quantityOnHand"
                  type="number"
                  min="0"
                  step="0.01"
                  {...itemForm.register("quantityOnHand")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Mức cảnh báo</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  min="0"
                  step="0.01"
                  {...itemForm.register("reorderLevel")}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplierName">Nhà cung cấp</Label>
                <Input
                  id="supplierName"
                  {...itemForm.register("supplierName")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierContact">Liên hệ nhà cung cấp</Label>
                <Input
                  id="supplierContact"
                  {...itemForm.register("supplierContact")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Input id="note" {...itemForm.register("note")} />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </DialogClose>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Đang lưu..."
                  : editingId
                    ? "Cập nhật"
                    : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cập nhật tồn kho</DialogTitle>
            <DialogDescription>
              {selectedInventory?.name || "Mặt hàng kho"}
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={stockForm.handleSubmit(handleSubmitStock)}
          >
            <div className="space-y-2">
              <Label>Hành động</Label>
              <Select
                value={stockForm.watch("action")}
                onValueChange={(value) => stockForm.setValue("action", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Nhập kho</SelectItem>
                  <SelectItem value="out">Xuất kho</SelectItem>
                  <SelectItem value="adjust">
                    Điều chỉnh tồn về giá trị mới
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-quantity">Số lượng</Label>
              <Input
                id="stock-quantity"
                type="number"
                min="0"
                step="0.01"
                {...stockForm.register("quantity")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-reason">Lý do</Label>
              <Input id="stock-reason" {...stockForm.register("reason")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-note">Ghi chú</Label>
              <Input id="stock-note" {...stockForm.register("note")} />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </DialogClose>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang cập nhật..." : "Xác nhận"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
