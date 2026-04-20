import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { Minus, Plus, Search, ShoppingCart, Sparkles } from "lucide-react";
import api from "@/services/api/client";
import { getCustomerAuthHeaders } from "@/services/customer-session";

const MENU_CATEGORIES = [{ id: "all", name: "Tất cả" }];

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cartItems, setCartItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(MENU_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const [menusResponse, categoriesResponse] = await Promise.all([
          api.get("/client/menus"),
          api.get("/client/categories"),
        ]);

        const nextCategories = [
          { id: "all", name: "Tất cả" },
          ...(categoriesResponse.data?.categories || []).map((category) => ({
            id: category.id || category.slug,
            name: category.name,
          })),
        ];

        setCategories(nextCategories);
        setMenuItems(
          (menusResponse.data?.menus || []).map((menu) => ({
            id: menu.id,
            menuId: menu.id,
            name: menu.name,
            categoryId: menu.categoryId,
            categoryName: menu.category || menu.categoryId,
            price: menu.price,
            image: menu.imageUrl || menu.image,
            description: menu.description,
            available: menu.available,
          })),
        );
      } catch (error) {
        toast.error(error?.response?.data?.message || "Không thể tải thực đơn");
      } finally {
        setLoading(false);
      }
    };

    loadMenus();
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchCategory =
        categoryFilter === "all" || item.categoryId === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [searchTerm, categoryFilter, menuItems]);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleAddToCart = (item) => {
    setCartItems((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);

      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [...current, { ...item, quantity: 1 }];
    });

    toast.success(`Đã thêm ${item.name}`);
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      setCartItems((current) => current.filter((item) => item.id !== itemId));
      return;
    }

    setCartItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, quantity } : item,
      ),
    );
  };

  const handleCheckout = async () => {
    if (!getCustomerAuthHeaders().Authorization) {
      toast.error("Vui lòng đăng nhập để đặt món");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng đang trống");
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post(
        "/client/orders",
        {
          items: cartItems.map((item) => ({
            menuId: item.menuId || item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            imageUrl: item.image,
            categoryId: item.category,
          })),
          paymentMethod: "cash",
          note: "",
        },
        {
          headers: getCustomerAuthHeaders(),
        },
      );

      toast.success(response.data?.message || "Đặt món thành công");
      setCartItems([]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tạo đơn hàng");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-[hsl(var(--customer-border))] bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge className="bg-[hsl(var(--customer-surface-soft))] text-[hsl(var(--customer-text-accent))] hover:bg-[hsl(var(--customer-surface-soft))]">
              Thực đơn hôm nay
            </Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Món ăn được chọn nhiều nhất
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                Khám phá các món nổi bật, chạm một lần để thêm nhanh vào giỏ và
                bắt đầu bữa ăn theo phong cách app đặt món hiện đại.
              </p>
            </div>
          </div>

          <Card className="border-[hsl(var(--customer-border))] bg-linear-to-br from-[hsl(var(--customer-surface-soft))] to-white shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-2xl bg-[hsl(var(--customer-primary))] p-3 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Ưu đãi trong hôm nay
                </p>
                <p className="font-semibold text-foreground">
                  Miễn phí trà chanh cho đơn trên 200k
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm món ăn, đồ uống, tráng miệng..."
              className="h-12 rounded-full border-[hsl(var(--customer-border))] bg-[hsl(var(--customer-surface-soft)/0.65)] pl-11"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:justify-end">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryFilter(category.id)}
                className={[
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all",
                  categoryFilter === category.id
                    ? "bg-[hsl(var(--customer-primary))] text-white shadow-lg shadow-[hsl(var(--customer-primary)/0.22)]"
                    : "border border-[hsl(var(--customer-border))] bg-white text-muted-foreground hover:bg-[hsl(var(--customer-surface-soft))] hover:text-[hsl(var(--customer-text-accent))]",
                ].join(" ")}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {loading ? (
            <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground sm:col-span-2">
              Đang tải thực đơn...
            </div>
          ) : (
            filteredItems.map((item) => (
              <Card
                key={item.id}
                className="group overflow-hidden border-[hsl(var(--customer-border))] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[hsl(var(--customer-primary)/0.14)]"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/0 to-black/0" />
                  <Badge className="absolute left-3 top-3 bg-white/90 text-[hsl(var(--customer-text-accent))] hover:bg-white">
                    {item.categoryName}
                  </Badge>
                </div>

                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[hsl(var(--customer-surface-soft))] px-3 py-2 text-right">
                      <p className="text-xs text-muted-foreground">Giá</p>
                      <p className="text-lg font-bold text-[hsl(var(--customer-text-accent))]">
                        {(item.price / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      Món đang hot
                    </div>
                    <Button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.available}
                      className="rounded-full bg-[hsl(var(--customer-primary))] px-4 text-white hover:bg-[hsl(var(--customer-primary-hover))]"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {item.available ? "Thêm nhanh" : "Hết món"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="h-fit border-[hsl(var(--customer-border))] bg-white shadow-sm lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[hsl(var(--customer-primary))]" />
              Giỏ hàng nhanh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.length > 0 ? (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[hsl(var(--customer-border))] bg-[hsl(var(--customer-surface-soft)/0.6)] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(item.price / 1000).toFixed(0)}k / món
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Giảm số lượng"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="rounded-full bg-white px-2 py-1 text-muted-foreground shadow-sm transition hover:text-[hsl(var(--customer-text-accent))]"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1 text-sm">
                        <button
                          type="button"
                          aria-label="Giảm số lượng"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="rounded-full p-1 text-muted-foreground hover:text-[hsl(var(--customer-text-accent))]"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-6 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Tăng số lượng"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="rounded-full p-1 text-muted-foreground hover:text-[hsl(var(--customer-text-accent))]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-semibold text-[hsl(var(--customer-text-accent))]">
                        {((item.price * item.quantity) / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                ))}

                <div className="rounded-2xl bg-linear-to-r from-[hsl(var(--customer-primary))] to-sky-400 p-4 text-white">
                  <div className="flex items-center justify-between text-sm text-white/90">
                    <span>Tạm tính</span>
                    <span>{(cartTotal / 1000).toFixed(0)}k ₫</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-lg font-bold">
                    <span>Tổng</span>
                    <span>{(cartTotal / 1000).toFixed(0)}k ₫</span>
                  </div>
                  <Button
                    className="mt-4 w-full rounded-full bg-white text-[hsl(var(--customer-text-accent))] hover:bg-[hsl(var(--customer-surface-soft))]"
                    onClick={handleCheckout}
                    disabled={submitting}
                  >
                    Tiến hành đặt món
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[hsl(var(--customer-border))] bg-[hsl(var(--customer-surface-soft)/0.6)] p-8 text-center">
                <ShoppingCart className="mx-auto h-10 w-10 text-sky-400" />
                <p className="mt-3 font-medium text-foreground">
                  Giỏ hàng đang trống
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Chạm vào nút Thêm nhanh ở các card món để bắt đầu.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
