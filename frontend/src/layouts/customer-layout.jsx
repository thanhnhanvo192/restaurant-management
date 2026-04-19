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
  LayoutDashboard,
  ListOrdered,
  LogOut,
  MenuSquare,
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
    <div className="relative min-h-screen overflow-hidden bg-[#fffaf5] text-foreground">
      <div className="absolute w-64 h-64 rounded-full pointer-events-none -left-20 -top-16 bg-orange-200/40 blur-3xl" />
      <div className="absolute rounded-full pointer-events-none -right-24 top-24 h-72 w-72 bg-amber-200/35 blur-3xl" />

      <div className="relative flex flex-col w-full min-h-screen gap-4 p-3 pb-24 mx-auto max-w-350 md:p-4 md:pb-24 lg:p-6 lg:pb-6">
        <header className="sticky top-3 z-50 rounded-3xl border border-orange-100 bg-white/90 p-3 shadow-[0_10px_30px_rgba(249,115,22,0.14)] backdrop-blur md:p-4">
          <div className="flex items-center gap-3">
            <div className="items-center hidden gap-3 px-3 py-2 rounded-2xl bg-orange-50 sm:flex">
              <div className="flex items-center justify-center text-white bg-orange-500 shadow-lg h-9 w-9 rounded-2xl shadow-orange-500/25">
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
                  className="relative text-orange-600 rounded-full hover:bg-orange-50 hover:text-orange-700"
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
                  className="flex h-auto items-center gap-2 rounded-full border border-orange-100 bg-orange-50/70 px-2.5 py-1.5 hover:bg-orange-100"
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

          <nav className="items-center hidden gap-2 pt-3 mt-3 border-t border-orange-100 lg:flex">
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
                        ? "border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                        : "border-orange-100 bg-orange-50/60 text-orange-700 hover:bg-orange-100",
                    ].join(" ")
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex gap-2 pb-1 mt-3 overflow-x-auto lg:hidden">
            {quickActions.map((action) => (
              <NavLink
                key={action.to}
                to={action.to}
                className="inline-flex shrink-0 items-center rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 transition hover:bg-orange-100"
              >
                {action.label}
              </NavLink>
            ))}
          </div>
        </header>

        <main className="min-h-0 flex-1 rounded-3xl border border-orange-100 bg-white/85 p-4 shadow-[0_12px_35px_rgba(249,115,22,0.10)] backdrop-blur md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation trên mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/95 px-2 py-2 shadow-[0_-8px_30px_rgba(249,115,22,0.08)] backdrop-blur lg:hidden">
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
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                      : "text-muted-foreground hover:bg-orange-50 hover:text-orange-600",
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
