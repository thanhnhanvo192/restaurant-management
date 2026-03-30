import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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

const PAGE_SIZE = 6;

const DEFAULT_CATEGORIES = [
  { id: "cat-appetizer", name: "Khai vị" },
  { id: "cat-main", name: "Món chính" },
  { id: "cat-drink", name: "Đồ uống" },
  { id: "cat-dessert", name: "Tráng miệng" },
];

const itemSchema = z.object({
  name: z.string().min(2, "Tên món phải có ít nhất 2 ký tự"),
  price: z.coerce.number().positive("Giá bán phải lớn hơn 0"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  description: z.string().optional(),
});

const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .max(30, "Tên danh mục tối đa 30 ký tự"),
});

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const toDataUri = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Không thể đọc file ảnh"));
    reader.readAsDataURL(file);
  });

const buildCategoryMap = (categories) => {
  const map = {};
  categories.forEach((category) => {
    map[category.id] = category.name;
  });
  return map;
};

const ManageMenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);

  const fetchMenus = async () => {
    try {
      const res = await api.get("/admin/menus");
      setMenuItems(res.data.menus);
      console.log("Menus: ", res.data.menus);
    } catch (error) {
      toast.error("Không thể tải dữ liệu thực đơn");
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const itemForm = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      price: "",
      categoryId: "",
      description: "",
    },
  });

  const categoryForm = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchSearch =
        normalizedSearch.length === 0 ||
        item.name.toLowerCase().includes(normalizedSearch);
      const matchCategory =
        categoryFilter === "all" || item.categoryId === categoryFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "serving" ? item.available : !item.available);

      return matchSearch && matchCategory && matchStatus;
    });
  }, [menuItems, normalizedSearch, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const pageItemIds = useMemo(
    () => paginatedItems.map((item) => item.id),
    [paginatedItems],
  );

  const selectedOnPage = useMemo(
    () => pageItemIds.filter((id) => selectedIds.includes(id)).length,
    [pageItemIds, selectedIds],
  );

  const isAllOnPageChecked =
    pageItemIds.length > 0 && selectedOnPage === pageItemIds.length;
  const isSomeOnPageChecked =
    selectedOnPage > 0 && selectedOnPage < pageItemIds.length;

  const totalServing = menuItems.filter((item) => item.available).length;
  const pausedCount = menuItems.filter((item) => !item.available).length;

  const bestSeller = useMemo(() => {
    if (menuItems.length === 0) {
      return null;
    }
    return [...menuItems].sort((a, b) => b.soldCount - a.soldCount)[0];
  }, [menuItems]);

  const openCreateItemDialog = () => {
    setEditingItemId(null);
    setImagePreview("");
    itemForm.reset({
      name: "",
      price: "",
      categoryId: categories[0]?.id || "",
      description: "",
    });
    setIsItemDialogOpen(true);
  };

  const openEditItemDialog = (item) => {
    setEditingItemId(item.id);
    setImagePreview(item.imageUrl || "");
    itemForm.reset({
      name: item.name,
      price: item.price,
      categoryId: item.categoryId,
      description: item.description || "",
    });
    setIsItemDialogOpen(true);
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    const dataUri = await toDataUri(file);
    setImagePreview(dataUri);
  };

  const handleSaveItem = itemForm.handleSubmit((values) => {
    const payload = {
      name: values.name.trim(),
      price: Number(values.price),
      categoryId: values.categoryId,
      description: values.description?.trim() || "",
      imageUrl:
        imagePreview ||
        "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=200&auto=format&fit=crop",
    };

    if (editingItemId) {
      setMenuItems((prev) =>
        prev.map((item) => {
          if (item.id !== editingItemId) return item;
          return { ...item, ...payload };
        }),
      );
      toast.success("Đã cập nhật món ăn");
    } else {
      const newItem = {
        id: crypto.randomUUID(),
        soldCount: 0,
        available: true,
        ...payload,
      };
      setMenuItems((prev) => [newItem, ...prev]);
      setCurrentPage(1);
      toast.success("Đã thêm món mới");
    }

    setIsItemDialogOpen(false);
  });

  const handleToggleAvailability = (itemId, checked) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, available: checked } : item,
      ),
    );
    toast.success(
      checked ? "Món đã mở phục vụ" : "Món đã chuyển sang hết hàng",
    );
  };

  const handleDeleteOne = (itemId) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
    setSelectedIds((prev) => prev.filter((id) => id !== itemId));
    toast.success("Đã xóa món ăn");
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    setMenuItems((prev) =>
      prev.filter((item) => !selectedIds.includes(item.id)),
    );
    toast.success(`Đã xóa ${selectedIds.length} món đã chọn`);
    setSelectedIds([]);
  };

  const toggleSelectOne = (itemId, checked) => {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(itemId)) return prev;
        return [...prev, itemId];
      }
      return prev.filter((id) => id !== itemId);
    });
  };

  const toggleSelectPage = (checked) => {
    if (checked) {
      setSelectedIds((prev) => [...new Set([...prev, ...pageItemIds])]);
      return;
    }
    setSelectedIds((prev) => prev.filter((id) => !pageItemIds.includes(id)));
  };

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const openAddCategoryDialog = () => {
    setEditingCategoryId(null);
    categoryForm.reset({ name: "" });
    setIsCategoryDialogOpen(true);
  };

  const openEditCategoryDialog = (category) => {
    setEditingCategoryId(category.id);
    categoryForm.reset({ name: category.name });
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = categoryForm.handleSubmit((values) => {
    const normalized = values.name.trim();

    const existed = categories.some(
      (category) =>
        category.name.toLowerCase() === normalized.toLowerCase() &&
        category.id !== editingCategoryId,
    );

    if (existed) {
      categoryForm.setError("name", {
        type: "manual",
        message: "Danh mục đã tồn tại",
      });
      return;
    }

    if (editingCategoryId) {
      setCategories((prev) =>
        prev.map((category) =>
          category.id === editingCategoryId
            ? { ...category, name: normalized }
            : category,
        ),
      );
      toast.success("Đã cập nhật danh mục");
    } else {
      const newCategory = {
        id: `cat-${crypto.randomUUID()}`,
        name: normalized,
      };
      setCategories((prev) => [...prev, newCategory]);
      toast.success("Đã thêm danh mục mới");
    }

    setIsCategoryDialogOpen(false);
  });

  const handleDeleteCategory = (categoryId) => {
    const usedByItems = menuItems.some(
      (item) => item.categoryId === categoryId,
    );
    if (usedByItems) {
      toast.error("Không thể xóa danh mục đang có món ăn");
      return;
    }

    setCategories((prev) =>
      prev.filter((category) => category.id !== categoryId),
    );

    if (categoryFilter === categoryId) {
      setCategoryFilter("all");
    }

    toast.success("Đã xóa danh mục");
  };

  const from =
    filteredItems.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, filteredItems.length);

  return (
    <div className="space-y-4">
      {/* Khối thống kê nhanh cho admin */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng món đang kinh doanh</CardDescription>
            <CardTitle className="text-2xl">{totalServing}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Đang phục vụ</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Món bán chạy nhất</CardDescription>
            <CardTitle className="text-base md:text-lg">
              {bestSeller ? bestSeller.name : "Chưa có dữ liệu"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="size-4" />
            <span>
              {bestSeller ? `${bestSeller.soldCount} lượt bán` : "0 lượt bán"}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Số món đang tạm ngưng</CardDescription>
            <CardTitle className="text-2xl">{pausedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive">Đã hết</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Quản lý thực đơn</CardTitle>
            <CardDescription>
              Tìm kiếm, lọc, cập nhật trạng thái món ăn và thao tác nhanh cho
              quản trị viên.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="grid w-full gap-2 sm:grid-cols-2 xl:max-w-3xl xl:grid-cols-[1.3fr_1fr_1fr]">
                <div className="relative">
                  <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên món"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <Select
                  value={categoryFilter}
                  onValueChange={(value) => {
                    setCategoryFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Lọc danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Lọc trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="serving">Còn phục vụ</SelectItem>
                    <SelectItem value="out">Đã hết</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={openCreateItemDialog} className="xl:self-start">
                <Plus className="size-4" />
                Thêm món mới
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Đã chọn {selectedIds.length} món.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0}
              >
                <Trash2 className="size-4" />
                Xóa hàng loạt
              </Button>
            </div>

            <div className="overflow-hidden border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          isAllOnPageChecked
                            ? true
                            : isSomeOnPageChecked
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={(checked) =>
                          toggleSelectPage(checked === true)
                        }
                        aria-label="Chọn tất cả"
                      />
                    </TableHead>
                    <TableHead className="w-20">Hình</TableHead>
                    <TableHead>Tên món</TableHead>
                    <TableHead className="w-36">Giá bán</TableHead>
                    <TableHead className="w-44">Trạng thái</TableHead>
                    <TableHead className="text-right w-28">Hành động</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedItems.length > 0 ? (
                    paginatedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(item.id)}
                            onCheckedChange={(checked) =>
                              toggleSelectOne(item.id, checked === true)
                            }
                            aria-label={`Chọn ${item.name}`}
                          />
                        </TableCell>

                        <TableCell>
                          <Avatar className="size-12.5 rounded-lg after:rounded-lg">
                            <AvatarImage src={item.imageUrl} alt={item.name} />
                            <AvatarFallback>
                              <UtensilsCrossed className="size-4" />
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium leading-5">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {categoryMap[item.categoryId] || "Chưa phân loại"}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          {currencyFormatter.format(item.price)}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.available}
                              onCheckedChange={(checked) =>
                                handleToggleAvailability(item.id, checked)
                              }
                              aria-label={`Trạng thái ${item.name}`}
                            />
                            <span className="text-sm text-muted-foreground">
                              {item.available ? "Còn phục vụ" : "Đã hết"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="icon-sm"
                              onClick={() => openEditItemDialog(item)}
                              aria-label={`Sửa ${item.name}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon-sm"
                              onClick={() => handleDeleteOne(item.id)}
                              aria-label={`Xóa ${item.name}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Không có món ăn phù hợp với bộ lọc hiện tại.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
              <p className="text-muted-foreground">
                Hiển thị {from}-{to} trên tổng {filteredItems.length} món.
              </p>

              <Pagination className="justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(currentPage - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                      text="Trước"
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          goToPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(currentPage + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                      text="Sau"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>

        {/* Khu vực quản lý danh mục */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Quản lý danh mục</CardTitle>
            <CardDescription>
              Thêm, sửa hoặc xóa danh mục món ăn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              variant="outline"
              onClick={openAddCategoryDialog}
            >
              <Plus className="size-4" />
              Thêm danh mục mới
            </Button>

            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between px-3 py-2 border rounded-md"
                >
                  <span className="text-sm font-medium">{category.name}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditCategoryDialog(category)}
                      aria-label={`Sửa ${category.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      aria-label={`Xóa ${category.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingItemId ? "Sửa món ăn" : "Thêm món mới"}
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin món ăn và lưu để cập nhật thực đơn.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveItem} className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên món</Label>
              <Input
                id="name"
                placeholder="Ví dụ: Cơm gà nướng"
                {...itemForm.register("name")}
              />
              {itemForm.formState.errors.name ? (
                <p className="text-xs text-destructive">
                  {itemForm.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="price">Giá bán</Label>
                <Input
                  id="price"
                  type="number"
                  min="1000"
                  step="1000"
                  {...itemForm.register("price")}
                />
                {itemForm.formState.errors.price ? (
                  <p className="text-xs text-destructive">
                    {itemForm.formState.errors.price.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label>Danh mục</Label>
                <Select
                  value={itemForm.watch("categoryId")}
                  onValueChange={(value) =>
                    itemForm.setValue("categoryId", value, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {itemForm.formState.errors.categoryId ? (
                  <p className="text-xs text-destructive">
                    {itemForm.formState.errors.categoryId.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Upload hình ảnh</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
              />
              {imagePreview ? (
                <Avatar className="rounded-lg size-16 after:rounded-lg">
                  <AvatarImage src={imagePreview} alt="preview" />
                  <AvatarFallback>
                    <UtensilsCrossed className="size-4" />
                  </AvatarFallback>
                </Avatar>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <Textarea
                id="description"
                rows={4}
                {...itemForm.register("description")}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </DialogClose>
              <Button type="submit">Lưu món</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategoryId ? "Sửa danh mục" : "Thêm danh mục mới"}
            </DialogTitle>
            <DialogDescription>Nhập tên danh mục món ăn.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">Tên danh mục</Label>
              <Input id="categoryName" {...categoryForm.register("name")} />
              {categoryForm.formState.errors.name ? (
                <p className="text-xs text-destructive">
                  {categoryForm.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </DialogClose>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageMenuPage;
