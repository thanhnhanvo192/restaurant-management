import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  ChevronDown,
  Home,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  MenuSquare,
  Table,
  UserCircle,
  UtensilsCrossed,
} from "lucide-react";

/**
 * CustomerLayout
 *
 * Layout chung dành cho khách hàng (role Customer)
 *
 * Cấu trúc:
 * - Header cố định ở phía trên
 * - Navigation menu ngang ở giữa header trên desktop
 * - Menu điều hướng dạng Sheet trên mobile
 * - Main content full width, padding p-4 md:p-6
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
  const [hasNotifications] = useState(true);

  const user = useMemo(
    () => ({
      name: "Nguyễn Văn A",
      email: "nguyenvana@gmail.com",
      avatar: "/avatars/customer.jpg",
    }),
    [],
  );

  const navigationItems = useMemo(
    () => [
      {
        name: "Trang chủ",
        to: "/customer",
        icon: LayoutDashboard,
        end: true,
      },
      {
        name: "Đặt bàn",
        to: "/customer/book-table",
        icon: Table,
      },
      {
        name: "Thực đơn & Gọi món",
        to: "/customer/menu",
        icon: MenuSquare,
      },
      {
        name: "Lịch sử đơn hàng",
        to: "/customer/orders",
        icon: ListOrdered,
      },
      {
        name: "Thông tin cá nhân",
        to: "/customer/profile",
        icon: UserCircle,
      },
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

  const navClassName = ({ isActive }) =>
    [
      "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
      "border border-transparent",
      isActive
        ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
        : "text-muted-foreground hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100",
    ].join(" ");

  const handleLogout = () => {
    // TODO: Gọi API logout và clear token nếu dự án đã có auth.
    console.log("Logout");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fffaf5] text-foreground">
      {/* Header cố định ở phía trên */}
      <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 shadow-[0_8px_30px_rgba(249,115,22,0.08)] backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 md:px-6">
          {/* Logo nhà hàng */}
          <div className="flex min-w-fit items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div className="hidden sm:flex sm:flex-col">
              <span className="text-base font-semibold tracking-tight text-foreground">
                Nhà hàng ABC
              </span>
              <span className="text-xs text-muted-foreground">
                Đặt bàn nhanh - gọi món tiện lợi
              </span>
            </div>
          </div>

          {/* Navigation menu trên desktop */}
          <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={navClassName}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Title hiện tại cho tablet/mobile */}
          <div className="flex-1 text-center lg:hidden">
            <p className="truncate text-sm font-medium text-foreground">
              {currentTitle}
            </p>
          </div>

          {/* Hành động bên phải */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Thông báo */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  title="Thông báo"
                >
                  <Bell className="h-5 w-5" />
                  {hasNotifications ? (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="text-base">
                  Thông báo
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Không có thông báo mới
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Avatar + tên khách hàng */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-auto items-center gap-2 rounded-full border border-orange-100 bg-orange-50/60 px-2.5 py-1.5 hover:bg-orange-100"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden items-center gap-1 sm:flex">
                    <div className="text-left text-sm leading-tight">
                      <p className="font-medium text-foreground line-clamp-1">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {user.email}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
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
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

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
                <Icon className="h-5 w-5" />
                <span className="leading-none text-center">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Main content full width */}
      <main className="flex-1 w-full pb-24 lg:pb-6">
        <div className="h-full w-full p-4 md:p-6">
          {/* Outlet: Render nội dung trang con tại đây */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
