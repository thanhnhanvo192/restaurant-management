import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import TableList from "@/features/tables/components/table-list";
import api from "@/services/api/client";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "available", label: "Còn trống" },
  { value: "occupied", label: "Đang phục vụ" },
  { value: "reserved", label: "Đã đặt trước" },
  { value: "cleaning", label: "Đang dọn" },
];

const ROW_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  (statusOption) => statusOption.value !== "all",
);

const PAGE_SIZE = 8;

const EMPTY_FORM = {
  tableNumber: "",
  area: "",
  capacity: "",
  status: "available",
};

const DRAWER_MODE = {
  add: "add",
  edit: "edit",
};

const normalizeTableRecord = (table) => ({
  ...table,
  id: table.id ?? table._id,
});

const Table = () => {
  const [tables, setTables] = useState([]);
  const [tableNumberQuery, setTableNumberQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTableIds, setSelectedTableIds] = useState([]);
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState(DRAWER_MODE.add);
  const [activeTableId, setActiveTableId] = useState(null);
  const [tableForm, setTableForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTables = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/admin/tables");
      setTables(
        Array.isArray(res.data?.tables)
          ? res.data.tables.map(normalizeTableRecord)
          : [],
      );
    } catch (error) {
      toast.error("Lỗi xảy ra khi truy xuất tables");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const filteredTables = useMemo(() => {
    const normalizedQuery = tableNumberQuery.trim().toLowerCase();

    return tables.filter((table) => {
      const matchesTableNumber =
        normalizedQuery.length === 0 ||
        table.tableNumber.toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" || table.status === statusFilter;

      return matchesTableNumber && matchesStatus;
    });
  }, [tableNumberQuery, statusFilter, tables]);

  const totalPages = Math.max(1, Math.ceil(filteredTables.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedTables = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredTables.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredTables]);

  const handleSearchChange = (event) => {
    setTableNumberQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const goToPage = (nextPage) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  const normalizeTableNumber = (value) => value.trim().toUpperCase();

  const resetFormState = useCallback(() => {
    setTableForm(EMPTY_FORM);
    setFormError("");
    setActiveTableId(null);
  }, []);

  const openAddDrawer = useCallback(() => {
    setDrawerMode(DRAWER_MODE.add);
    resetFormState();
    setIsFormDrawerOpen(true);
  }, [resetFormState]);

  const openEditDrawer = useCallback((table) => {
    setDrawerMode(DRAWER_MODE.edit);
    setActiveTableId(table.id);
    setTableForm({
      tableNumber: table.tableNumber,
      area: table.area,
      capacity: String(table.capacity),
      status: table.status,
    });
    setFormError("");
    setIsFormDrawerOpen(true);
  }, []);

  const closeFormDrawer = useCallback(() => {
    setIsFormDrawerOpen(false);
    setFormError("");
  }, []);

  const handleFormInputChange = (fieldName, value) => {
    setTableForm((previousForm) => ({
      ...previousForm,
      [fieldName]: value,
    }));
  };

  const validateTableForm = (editingId = null) => {
    const normalizedTableNumber = normalizeTableNumber(tableForm.tableNumber);
    const normalizedArea = tableForm.area.trim();
    const capacityNumber = Number.parseInt(tableForm.capacity, 10);

    if (
      !normalizedTableNumber ||
      !normalizedArea ||
      Number.isNaN(capacityNumber) ||
      capacityNumber <= 0
    ) {
      return {
        valid: false,
        message: "Vui lòng nhập đầy đủ số bàn, khu vực và sức chứa hợp lệ.",
      };
    }

    const isDuplicateTableNumber = tables.some((table) => {
      if (editingId !== null && table.id === editingId) {
        return false;
      }

      return (
        table.tableNumber.toLowerCase() === normalizedTableNumber.toLowerCase()
      );
    });

    if (isDuplicateTableNumber) {
      return {
        valid: false,
        message: "Số bàn đã tồn tại. Vui lòng nhập số bàn khác.",
      };
    }

    return {
      valid: true,
      payload: {
        tableNumber: normalizedTableNumber,
        area: normalizedArea,
        capacity: capacityNumber,
        status: tableForm.status,
      },
    };
  };

  const handleSubmitTableForm = async (event) => {
    event.preventDefault();

    const result = validateTableForm(
      drawerMode === DRAWER_MODE.edit ? activeTableId : null,
    );

    if (!result.valid) {
      setFormError(result.message);
      return;
    }

    if (drawerMode === DRAWER_MODE.add) {
      try {
        setIsSubmitting(true);

        // Gọi API thêm bàn mới, backend nhận: tableNumber, area, capacity, status.
        const response = await api.post("/admin/tables", result.payload);
        const createdTable = normalizeTableRecord(response.data?.table);

        setTables((previousTables) => [createdTable, ...previousTables]);
        setCurrentPage(1);
        setIsFormDrawerOpen(false);
        resetFormState();
        toast.success("Thêm bàn mới thành công");
      } catch (error) {
        const apiMessage =
          error?.response?.data?.message ||
          "Không thể thêm bàn. Vui lòng thử lại.";
        setFormError(apiMessage);
        toast.error(apiMessage);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (drawerMode === DRAWER_MODE.edit && activeTableId !== null) {
      try {
        setIsSubmitting(true);

        // Gọi API cập nhật bàn theo id.
        const response = await api.put(
          `/admin/tables/${activeTableId}`,
          result.payload,
        );

        const updatedFromApi = response?.data?.table
          ? normalizeTableRecord(response.data.table)
          : null;

        setTables((previousTables) =>
          previousTables.map((table) => {
            if (table.id !== activeTableId) {
              return table;
            }

            return updatedFromApi
              ? updatedFromApi
              : {
                  ...table,
                  ...result.payload,
                };
          }),
        );

        setIsFormDrawerOpen(false);
        resetFormState();
        toast.success("Cập nhật bàn thành công");
      } catch (error) {
        const apiMessage =
          error?.response?.data?.message ||
          "Không thể cập nhật bàn. Vui lòng thử lại.";
        setFormError(apiMessage);
        toast.error(apiMessage);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsFormDrawerOpen(false);
    resetFormState();
  };

  const handleDeleteTable = useCallback(
    async (tableId) => {
      if (!tableId) {
        return;
      }

      try {
        setIsDeleting(true);
        await api.delete(`/admin/tables/${tableId}`);

        setTables((previousTables) =>
          previousTables.filter((table) => table.id !== tableId),
        );
        setSelectedTableIds((previousSelectedIds) =>
          previousSelectedIds.filter((id) => id !== tableId),
        );

        if (activeTableId === tableId) {
          closeFormDrawer();
          resetFormState();
        }

        toast.success("Xoá bàn thành công");
      } catch (error) {
        const apiMessage =
          error?.response?.data?.message ||
          "Không thể xoá bàn. Vui lòng thử lại.";
        toast.error(apiMessage);
      } finally {
        setIsDeleting(false);
      }
    },
    [activeTableId, closeFormDrawer, resetFormState],
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedTableIds.length === 0 || isDeleting) {
      return;
    }

    const shouldDelete = window.confirm(
      `Bạn có chắc chắn muốn xoá ${selectedTableIds.length} bàn đã chọn?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setIsDeleting(true);

      const deleteResults = await Promise.allSettled(
        selectedTableIds.map((tableId) =>
          api.delete(`/admin/tables/${tableId}`),
        ),
      );

      const successIds = selectedTableIds.filter(
        (_, index) => deleteResults[index].status === "fulfilled",
      );

      const failedCount = selectedTableIds.length - successIds.length;

      if (successIds.length > 0) {
        setTables((previousTables) =>
          previousTables.filter((table) => !successIds.includes(table.id)),
        );
        setSelectedTableIds((previousSelectedIds) =>
          previousSelectedIds.filter((id) => !successIds.includes(id)),
        );

        if (activeTableId !== null && successIds.includes(activeTableId)) {
          closeFormDrawer();
          resetFormState();
        }
      }

      if (failedCount === 0) {
        toast.success("Xoá các bàn đã chọn thành công");
      } else {
        toast.error(
          `Đã xoá ${successIds.length} bàn, thất bại ${failedCount} bàn.`,
        );
      }
    } catch (error) {
      toast.error("Không thể xoá các bàn đã chọn. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  }, [
    activeTableId,
    closeFormDrawer,
    isDeleting,
    resetFormState,
    selectedTableIds,
  ]);

  const toggleSelectTable = useCallback((tableId, checked) => {
    setSelectedTableIds((previousSelectedIds) => {
      if (checked) {
        if (previousSelectedIds.includes(tableId)) {
          return previousSelectedIds;
        }

        return [...previousSelectedIds, tableId];
      }

      return previousSelectedIds.filter((id) => id !== tableId);
    });
  }, []);

  const paginatedTableIds = paginatedTables.map((table) => table.id);
  const selectedInCurrentPageCount = paginatedTableIds.filter((tableId) =>
    selectedTableIds.includes(tableId),
  ).length;

  const isAllCurrentPageSelected =
    paginatedTableIds.length > 0 &&
    selectedInCurrentPageCount === paginatedTableIds.length;

  const toggleSelectAllInCurrentPage = useCallback(
    (checked) => {
      if (checked) {
        setSelectedTableIds((previousSelectedIds) => {
          const nextSelectedIds = new Set(previousSelectedIds);
          paginatedTableIds.forEach((tableId) => nextSelectedIds.add(tableId));
          return [...nextSelectedIds];
        });
        return;
      }

      setSelectedTableIds((previousSelectedIds) =>
        previousSelectedIds.filter(
          (tableId) => !paginatedTableIds.includes(tableId),
        ),
      );
    },
    [paginatedTableIds],
  );

  const handleStatusUpdate = useCallback(
    async (tableId, nextStatus) => {
      const targetTable = tables.find((table) => table.id === tableId);

      if (!targetTable || targetTable.status === nextStatus) {
        return;
      }

      setTables((previousTables) =>
        previousTables.map((table) =>
          table.id === tableId ? { ...table, status: nextStatus } : table,
        ),
      );

      try {
        const response = await api.put(`/admin/tables/${tableId}`, {
          tableNumber: targetTable.tableNumber,
          area: targetTable.area,
          capacity: targetTable.capacity,
          status: nextStatus,
        });

        const updatedFromApi = response?.data?.table
          ? normalizeTableRecord(response.data.table)
          : null;

        if (updatedFromApi) {
          setTables((previousTables) =>
            previousTables.map((table) =>
              table.id === tableId ? updatedFromApi : table,
            ),
          );
        }

        toast.success("Cập nhật trạng thái bàn thành công");
      } catch (error) {
        setTables((previousTables) =>
          previousTables.map((table) =>
            table.id === tableId
              ? { ...table, status: targetTable.status }
              : table,
          ),
        );

        const apiMessage =
          error?.response?.data?.message ||
          "Không thể cập nhật trạng thái bàn. Vui lòng thử lại.";
        toast.error(apiMessage);
      }
    },
    [tables],
  );

  const from =
    filteredTables.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, filteredTables.length);

  const drawerTitle =
    drawerMode === DRAWER_MODE.add ? "Thêm bàn ăn" : "Sửa thông tin bàn ăn";
  const drawerDescription =
    drawerMode === DRAWER_MODE.add
      ? "Nhập thông tin bàn mới cho nhà hàng."
      : "Cập nhật thông tin bàn ăn đã chọn.";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý bàn ăn</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={tableNumberQuery}
                onChange={handleSearchChange}
                placeholder="Tìm theo số bàn, ví dụ: B08"
                className="pl-8"
              />
            </div>

            <div className="flex flex-col w-full gap-2 md:w-auto md:flex-row">
              <div className="w-full md:w-56">
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((statusOption) => (
                      <SelectItem
                        key={statusOption.value}
                        value={statusOption.value}
                      >
                        {statusOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={openAddDrawer} disabled={isDeleting}>
                Thêm bàn
              </Button>
            </div>
          </div>

          <TableList
            paginatedTables={isLoading ? [] : paginatedTables}
            selectedTableIds={selectedTableIds}
            selectedCount={selectedTableIds.length}
            isDeleting={isDeleting}
            isAllCurrentPageSelected={isAllCurrentPageSelected}
            rowStatusOptions={ROW_STATUS_OPTIONS}
            onToggleSelectAllInCurrentPage={toggleSelectAllInCurrentPage}
            onToggleSelectTable={toggleSelectTable}
            onStatusUpdate={handleStatusUpdate}
            onEdit={openEditDrawer}
            onDelete={handleDeleteTable}
            onBulkDelete={handleBulkDelete}
          />

          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Đang tải danh sách bàn...
            </p>
          ) : null}

          <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
            <p className="text-muted-foreground">
              Hiển thị {from}-{to} trên tổng {filteredTables.length} bàn ăn.
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </Button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ),
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Drawer
        open={isFormDrawerOpen}
        onOpenChange={(open) => {
          setIsFormDrawerOpen(open);
          if (!open) {
            setFormError("");
          }
        }}
        direction="right"
      >
        <DrawerContent className="w-full sm:max-w-md">
          <DrawerHeader>
            <DrawerTitle>{drawerTitle}</DrawerTitle>
            <DrawerDescription>{drawerDescription}</DrawerDescription>
          </DrawerHeader>

          <form
            onSubmit={handleSubmitTableForm}
            className="flex flex-col gap-3 px-4 pb-2"
          >
            <Input
              value={tableForm.tableNumber}
              onChange={(event) =>
                handleFormInputChange("tableNumber", event.target.value)
              }
              placeholder="Số bàn (vd: B21)"
            />

            <Input
              value={tableForm.area}
              onChange={(event) =>
                handleFormInputChange("area", event.target.value)
              }
              placeholder="Khu vực"
            />

            <Input
              type="number"
              min="1"
              value={tableForm.capacity}
              onChange={(event) =>
                handleFormInputChange("capacity", event.target.value)
              }
              placeholder="Sức chứa"
            />

            <Select
              value={tableForm.status}
              onValueChange={(value) => handleFormInputChange("status", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {ROW_STATUS_OPTIONS.map((statusOption) => (
                  <SelectItem
                    key={statusOption.value}
                    value={statusOption.value}
                  >
                    {statusOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}

            <DrawerFooter className="px-0 pt-0">
              <Button type="submit" disabled={isSubmitting}>
                {drawerMode === DRAWER_MODE.add
                  ? isSubmitting
                    ? "Đang lưu..."
                    : "Lưu bàn mới"
                  : "Lưu thay đổi"}
              </Button>
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeFormDrawer}
                >
                  Huỷ
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Table;
