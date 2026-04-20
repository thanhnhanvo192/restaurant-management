import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Bell,
  ChevronDown,
  Clock3,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  MenuSquare,
  Phone,
  Table,
  UserCircle,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";

import api from "@/services/api/client";
import {
  clearCustomerSession,
  getCustomerAuthHeaders,
  getCustomerProfileCache,
  setCustomerProfileCache,
} from "@/services/customer-session";

/**
 * CustomerLayout
 *
 * Layout chung dành cho khách hàng (role Customer)
 *
 * Cấu trúc:
 * - Header điều hướng ở phía trên
 * - Bottom navigation trên mobile
 * - Nội dung chính theo full-width shell
 *
 * Sử dụng:
 * <Route path="customer" element={<CustomerLayout />}>
 *   <Route path="dashboard" element={<CustomerDashboardPage />} />
 *   <Route path="book-table" element={<BookTablePage />} />
 *   ...
 * </Route>
 */
export default function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasNotifications] = useState(true);
  const [user, setUser] = useState(
    getCustomerProfileCache() || {
      name: "Khách hàng",
      email: "",
      avatar: "/avatars/customer.jpg",
    },
  );

  useEffect(() => {
    const loadProfile = async () => {
      if (!getCustomerAuthHeaders().Authorization) {
        return;
      }

      try {
        const response = await api.get("/auth/me", {
          headers: getCustomerAuthHeaders(),
        });
        const profile =
          response.data?.customer || response.data?.profile || null;

        if (profile) {
          const nextUser = {
            name: profile.name || "Khách hàng",
            email: profile.email || "",
            avatar:
              profile.avatarUrl || profile.avatar || "/avatars/customer.jpg",
          };
          setUser(nextUser);
          setCustomerProfileCache(nextUser);
        }
      } catch {
        // Giữ dữ liệu cache nếu token đã hết hạn hoặc chưa đăng nhập.
      }
    };

    loadProfile();
  }, []);

  const navigationItems = useMemo(
    () => [
      {
        name: "Trang chủ",
        shortName: "Trang chủ",
        to: "/customer",
        icon: LayoutDashboard,
        end: true,
      },
      {
        name: "Đặt bàn",
        shortName: "Đặt bàn",
        to: "/customer/book-table",
        icon: Table,
      },
      {
        name: "Thực đơn & Gọi món",
        shortName: "Gọi món",
        to: "/customer/menu",
        icon: MenuSquare,
      },
      {
        name: "Lịch sử đơn hàng",
        shortName: "Đơn hàng",
        to: "/customer/orders",
        icon: ListOrdered,
      },
      {
        name: "Thông tin cá nhân",
        shortName: "Hồ sơ",
        to: "/customer/profile",
        icon: UserCircle,
      },
    ],
    [],
  );

  const quickActions = useMemo(
    () => [
      { label: "Gọi món ngay", to: "/customer/menu" },
      { label: "Đặt bàn", to: "/customer/book-table" },
      { label: "Đơn gần đây", to: "/customer/orders" },
    ],
    [],
  );

  const storeInfo = useMemo(
    () => [
      { label: "Hotline", value: "1900 1234", icon: Phone },
      { label: "Giờ mở cửa", value: "11:00 - 22:00", icon: Clock3 },
      { label: "Bàn trống", value: "Đặt nhanh trong ngày", icon: Table },
    ],
    [],
  );

  const currentTitle = useMemo(() => {
    const currentItem = navigationItems.find((item) => {
      if (item.end) {
        return location.pathname === item.to;
      }

      return location.pathname.startsWith(item.to);
    });

    return currentItem?.name ?? "Khách hàng";
  }, [location.pathname, navigationItems]);

  const currentSubtitle = useMemo(() => {
    switch (currentTitle) {
      case "Trang chủ":
        return "Xem nhanh ưu đãi và hoạt động gần đây";
      case "Đặt bàn":
        return "Chọn vị trí ngồi phù hợp và xác nhận nhanh";
      case "Thực đơn & Gọi món":
        return "Khám phá món ngon và tạo đơn tức thì";
      case "Lịch sử đơn hàng":
        return "Theo dõi các đơn đã đặt và trạng thái xử lý";
      case "Thông tin cá nhân":
        return "Quản lý hồ sơ và cài đặt tài khoản";
      default:
        return "Chào mừng bạn quay lại";
    }
  }, [currentTitle]);

  const handleLogout = () => {
    const logout = async () => {
      try {
        await api.post(
          "/auth/logout",
          {
            refreshToken: localStorage.getItem("customerRefreshToken") || "",
          },
          {
            headers: getCustomerAuthHeaders(),
          },
        );
      } catch {
        // Ignore logout errors; local session is still cleared.
      } finally {
        clearCustomerSession();
        toast.success("Đã đăng xuất");
        navigate("/");
      }
    };

    logout();
  };

  return (
    <div className="customer-theme-ocean relative min-h-screen overflow-hidden bg-[hsl(var(--customer-bg))] text-foreground">
      <div className="absolute h-64 w-64 rounded-full bg-[hsl(var(--customer-orb-a)/0.45)] blur-3xl pointer-events-none -left-20 -top-16" />
      <div className="absolute h-72 w-72 rounded-full bg-[hsl(var(--customer-orb-b)/0.4)] blur-3xl pointer-events-none -right-24 top-24" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-350 flex-col gap-4 p-3 pb-24 md:p-4 md:pb-24 lg:p-6 lg:pb-6">
        <header className="sticky top-3 z-50 rounded-3xl border border-[hsl(var(--customer-border))] bg-[hsl(var(--customer-surface)/0.9)] p-3 shadow-[0_10px_30px_hsl(var(--customer-primary)/0.16)] backdrop-blur md:p-4">
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 rounded-2xl bg-[hsl(var(--customer-surface-soft))] px-3 py-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[hsl(var(--customer-primary))] text-[hsl(var(--customer-primary-foreground))] shadow-lg shadow-[hsl(var(--customer-primary)/0.25)]">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight">
                  Nhà hàng NATAVU
                </p>
                <p className="text-xs text-muted-foreground">
                  Đặt bàn nhanh, gọi món tiện lợi
                </p>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold tracking-tight truncate md:text-xl">
                {currentTitle}
              </p>
              <p className="text-xs truncate text-muted-foreground md:text-sm">
                {currentSubtitle}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full text-[hsl(var(--customer-text-accent))] hover:bg-[hsl(var(--customer-surface-soft))] hover:text-[hsl(var(--customer-text-accent))]"
                  title="Thông báo"
                >
                  <Bell className="w-5 h-5" />
                  {hasNotifications ? (
                    <span className="absolute w-2 h-2 bg-red-500 rounded-full right-1 top-1" />
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="text-base">
                  Thông báo
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-4 text-sm text-center text-muted-foreground">
                  Không có thông báo mới
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-auto items-center gap-2 rounded-full border border-[hsl(var(--customer-border))] bg-[hsl(var(--customer-surface-soft)/0.8)] px-2.5 py-1.5 hover:bg-[hsl(var(--customer-surface-soft))]"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="items-center hidden gap-1 sm:flex">
                    <div className="text-sm leading-tight text-left">
                      <p className="font-medium line-clamp-1 text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs line-clamp-1 text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.name}
                      </p>
                      <p className="text-xs truncate text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  Hồ sơ cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Cài đặt
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <nav className="mt-3 hidden items-center gap-2 border-t border-[hsl(var(--customer-border))] pt-3 lg:flex">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition",
                      isActive
                        ? "border-[hsl(var(--customer-primary))] bg-[hsl(var(--customer-primary))] text-[hsl(var(--customer-primary-foreground))] shadow-sm shadow-[hsl(var(--customer-primary)/0.25)]"
                        : "border-[hsl(var(--customer-border))] bg-[hsl(var(--customer-surface-soft)/0.65)] text-[hsl(var(--customer-text-accent))] hover:bg-[hsl(var(--customer-surface-soft))]",
                    ].join(" ")
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-3 hidden items-center justify-between gap-3 rounded-2xl border border-[hsl(var(--customer-border))] bg-[hsl(var(--customer-surface-soft)/0.7)] px-4 py-3 lg:flex">
            <div className="grid flex-1 grid-cols-3 gap-3">
              {storeInfo.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[hsl(var(--customer-primary))] shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="truncate text-sm font-semibold text-[hsl(var(--customer-text-accent))]">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              asChild
              className="rounded-full bg-[hsl(var(--customer-primary))] px-4 text-sm font-semibold text-white hover:bg-[hsl(var(--customer-primary-hover))]"
            >
              <NavLink to="/customer/book-table">Đặt bàn ngay</NavLink>
            </Button>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {quickActions.map((action) => (
              <NavLink
                key={action.to}
                to={action.to}
                className="inline-flex shrink-0 items-center rounded-full border border-[hsl(var(--customer-border))] bg-[hsl(var(--customer-surface-soft))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--customer-text-accent))] transition hover:bg-[hsl(var(--customer-surface-soft)/0.85)]"
              >
                {action.label}
              </NavLink>
            ))}
          </div>
        </header>

        <main className="min-h-0 flex-1 rounded-3xl border border-[hsl(var(--customer-border))] bg-[hsl(var(--customer-surface)/0.86)] p-4 shadow-[0_12px_35px_hsl(var(--customer-primary)/0.12)] backdrop-blur md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation trên mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[hsl(var(--customer-border))] bg-[hsl(var(--customer-surface)/0.96)] px-2 py-2 shadow-[0_-8px_30px_hsl(var(--customer-primary)/0.1)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-medium transition-colors",
                    isActive
                      ? "bg-[hsl(var(--customer-primary))] text-[hsl(var(--customer-primary-foreground))] shadow-sm shadow-[hsl(var(--customer-primary)/0.25)]"
                      : "text-muted-foreground hover:bg-[hsl(var(--customer-surface-soft))] hover:text-[hsl(var(--customer-text-accent))]",
                  ].join(" ")
                }
              >
                <Icon className="w-5 h-5" />
                <span className="leading-none text-center">
                  {item.shortName}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
