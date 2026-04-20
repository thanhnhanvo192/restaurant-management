import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock,
  LockOpen,
  MoreVertical,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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

const ROLES = {
  admin: "Admin",
  waiter: "Waiter",
  kitchen: "Kitchen",
  "inventory-manager": "Quản lý kho",
};

const PAGE_SIZE = 5;

const staffSchema = z.object({
  fullName: z.string().trim().min(1, "Họ tên là bắt buộc"),
  email: z
    .string()
    .trim()
    .min(1, "Email là bắt buộc")
    .email("Email không hợp lệ"),
  phone: z.string().trim().min(1, "Số điện thoại là bắt buộc"),
  role: z.enum(["admin", "waiter", "kitchen", "inventory-manager"]),
  password: z.string().optional(),
});

const defaultValues = {
  fullName: "",
  email: "",
  phone: "",
  role: "waiter",
  password: "",
};

const roleBadgeClassMap = {
  admin: "bg-violet-100 text-violet-700",
  waiter: "bg-blue-100 text-blue-700",
  kitchen: "bg-orange-100 text-orange-700",
  "inventory-manager": "bg-emerald-100 text-emerald-700",
};

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const getInitials = (fullName) => {
  const words = fullName.trim().split(" ").filter(Boolean);

  if (words.length === 0) return "NV";

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
};

const getErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;
  const detailMessage = Array.isArray(responseData?.error?.details)
    ? responseData.error.details[0]?.message
    : null;

  return detailMessage || responseData?.message || fallbackMessage;
};

const Staff = () => {
  const [staffs, setStaffs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutatingStaffId, setMutatingStaffId] = useState(null);

  const fetchStaffs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin/staffs", {
        params: {
          page: 1,
          limit: 100,
        },
      });
      setStaffs(
        Array.isArray(response.data?.staffs) ? response.data.staffs : [],
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Lỗi xảy ra khi truy xuất nhân viên"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  const form = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues,
  });

  const isEditMode = editingStaffId !== null;

  const filteredStaffs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) return staffs;

    return staffs.filter((staff) =>
      staff.fullName.toLowerCase().includes(normalizedQuery),
    );
  }, [searchQuery, staffs]);

  const totalPages = Math.max(1, Math.ceil(filteredStaffs.length / PAGE_SIZE));

  const paginatedStaffs = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredStaffs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredStaffs]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingStaffId(null);
    form.reset(defaultValues);
  };

  const openAddDialog = () => {
    setEditingStaffId(null);
    form.reset(defaultValues);
    setIsDialogOpen(true);
  };

  const openEditDialog = (staff) => {
    setEditingStaffId(staff.id);
    form.reset({
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      password: "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values) => {
    // Khi thêm mới, yêu cầu mật khẩu khởi tạo để tạo tài khoản nhân viên.
    if (
      !isEditMode &&
      (!values.password || values.password.trim().length < 6)
    ) {
      form.setError("password", {
        type: "manual",
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
      return;
    }

    const payload = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      role: values.role,
    };

    if (!isEditMode) {
      payload.password = values.password.trim();
    }

    try {
      setIsSubmitting(true);

      if (isEditMode) {
        const response = await api.put(
          `/admin/staffs/${editingStaffId}`,
          payload,
        );
        const updatedStaff = response.data?.staff;

        setStaffs((previousStaffs) =>
          previousStaffs.map((staff) =>
            staff.id === editingStaffId ? updatedStaff || staff : staff,
          ),
        );

        toast.success("Cập nhật nhân viên thành công");
      } else {
        const response = await api.post("/admin/staffs", payload);
        const createdStaff = response.data?.staff;

        setStaffs((previousStaffs) =>
          createdStaff ? [createdStaff, ...previousStaffs] : previousStaffs,
        );
        setCurrentPage(1);
        toast.success("Thêm nhân viên thành công");
      }

      closeDialog();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể lưu thông tin nhân viên"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStaffStatus = async (staffId) => {
    const targetStaff = staffs.find((staff) => staff.id === staffId);

    if (!targetStaff) {
      return;
    }

    try {
      setMutatingStaffId(staffId);

      const response = await api.put(`/admin/staffs/${staffId}`, {
        active: !targetStaff.active,
      });
      const updatedStaff = response.data?.staff;

      setStaffs((previousStaffs) =>
        previousStaffs.map((staff) =>
          staff.id === staffId ? updatedStaff || staff : staff,
        ),
      );

      toast.success(
        targetStaff.active ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Không thể cập nhật trạng thái tài khoản"),
      );
    } finally {
      setMutatingStaffId(null);
    }
  };

  const updateStaffRole = async (staffId, nextRole) => {
    const targetStaff = staffs.find((staff) => staff.id === staffId);

    if (!targetStaff || targetStaff.role === nextRole) {
      return;
    }

    try {
      setMutatingStaffId(staffId);

      const response = await api.put(`/admin/staffs/${staffId}`, {
        role: nextRole,
      });
      const updatedStaff = response.data?.staff;

      setStaffs((previousStaffs) =>
        previousStaffs.map((staff) =>
          staff.id === staffId ? updatedStaff || staff : staff,
        ),
      );

      toast.success("Cập nhật vai trò thành công");
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể cập nhật vai trò"));
    } finally {
      setMutatingStaffId(null);
    }
  };

  const deleteStaff = async (staffId) => {
    if (!staffId) {
      return;
    }

    const shouldDelete = window.confirm("Bạn có chắc muốn xóa nhân viên này?");
    if (!shouldDelete) {
      return;
    }

    try {
      setMutatingStaffId(staffId);
      await api.delete(`/admin/staffs/${staffId}`);

      setStaffs((previousStaffs) =>
        previousStaffs.filter((staff) => staff.id !== staffId),
      );

      toast.success("Xóa nhân viên thành công");
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa nhân viên"));
    } finally {
      setMutatingStaffId(null);
    }
  };

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
              setCurrentPage(page);
            }}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  return (
    <section className="p-4 space-y-6 md:p-6">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight md:text-3xl">
                Quản lý nhân viên
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Theo dõi thông tin nhân sự và phân quyền tài khoản nhân viên.
              </p>
            </div>

            <Button onClick={openAddDialog} className="w-full sm:w-auto">
              <Plus className="mr-2 size-4" />
              Thêm nhân viên mới
            </Button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute -translate-y-1/2 pointer-events-none top-1/2 left-3 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên nhân viên"
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Ngày bắt đầu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Đang tải dữ liệu nhân viên...
                  </TableCell>
                </TableRow>
              ) : paginatedStaffs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Không tìm thấy nhân viên phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStaffs.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-slate-100 text-slate-700">
                            {getInitials(staff.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="font-medium">{staff.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {staff.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{staff.phone || "-"}</TableCell>

                    <TableCell>
                      <Select
                        value={staff.role}
                        onValueChange={(value) =>
                          updateStaffRole(staff.id, value)
                        }
                        disabled={mutatingStaffId === staff.id}
                      >
                        <SelectTrigger
                          className={`w-32.5 border-0 font-medium ${roleBadgeClassMap[staff.role]}`}
                        >
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="waiter">Waiter</SelectItem>
                          <SelectItem value="kitchen">Kitchen</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>{formatDate(staff.startDate)}</TableCell>

                    <TableCell>
                      <Badge
                        className={
                          staff.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }
                      >
                        {staff.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(staff)}
                        >
                          <Pencil className="mr-1 size-4" />
                          Sửa
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Tùy chọn nhân viên"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => toggleStaffStatus(staff.id)}
                              className="cursor-pointer"
                              disabled={mutatingStaffId === staff.id}
                            >
                              {staff.active ? (
                                <>
                                  <Lock className="size-4" />
                                  Khóa tài khoản
                                </>
                              ) : (
                                <>
                                  <LockOpen className="size-4" />
                                  Mở khóa
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteStaff(staff.id)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                              disabled={mutatingStaffId === staff.id}
                            >
                              Xóa nhân viên
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-3 pt-4 border-t sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Hiển thị {paginatedStaffs.length} / {filteredStaffs.length} nhân
              viên
            </p>

            <Pagination className="justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage((prevPage) => Math.max(1, prevPage - 1));
                    }}
                  />
                </PaginationItem>

                {renderPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage((prevPage) =>
                        Math.min(totalPages, prevPage + 1),
                      );
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeDialog();
          else setIsDialogOpen(true);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Sửa nhân viên" : "Thêm nhân viên mới"}
            </DialogTitle>
            <DialogDescription>
              Điền đầy đủ thông tin nhân sự để cập nhật hệ thống.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Họ tên</Label>
              <Input
                id="fullName"
                placeholder="Nguyen Van A"
                {...form.register("fullName")}
              />
              {form.formState.errors.fullName ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.fullName.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nhanvien@restaurant.vn"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                placeholder="09xxxxxxxx"
                {...form.register("phone")}
              />
              {form.formState.errors.phone ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label>Vai trò</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(value) =>
                  form.setValue("role", value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="waiter">Waiter</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isEditMode ? (
              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu ban đầu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  {...form.register("password")}
                />
                {form.formState.errors.password ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                ) : null}
              </div>
            ) : null}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Hủy
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Staff;
