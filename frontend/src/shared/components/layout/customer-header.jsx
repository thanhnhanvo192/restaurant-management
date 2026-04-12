import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Bell, LogOut, User, Settings, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { UtensilsCrossed } from "lucide-react";

// Mock user data
const USER_DATA = {
  name: "Nguyễn Văn A",
  email: "nguyenvana@gmail.com",
  avatar: "/avatars/customer.jpg",
};

export function CustomerHeader() {
  const [hasNotifications, setHasNotifications] = useState(true);

  const handleLogout = () => {
    // TODO: Gọi API logout
    console.log("Logout");
    // Redirect đến login page hoặc home page
    // window.location.href = "/login";
  };

  return (
    <header className="h-16 border-b border-border bg-background sticky top-0 z-50 shadow-sm">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* ============= Bên trái: Logo nhà hàng ============= */}
        <div className="flex items-center gap-2 min-w-fit">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">
            Nhà hàng ABC
          </h1>
        </div>

        {/* ============= Giữa: Tiêu đề trang (có thể để trống hoặc breadcrumb) ============= */}
        <div className="flex-1 text-center">
          {/* Có thể thêm breadcrumb hoặc page title tại đây */}
          {/* <p className="text-sm text-muted-foreground">Dashboard</p> */}
        </div>

        {/* ============= Bên phải: User menu + Notification + Logout ============= */}
        <div className="flex items-center gap-2">
          {/* Nút Thông báo */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                title="Thông báo"
              >
                <Bell className="w-5 h-5" />
                {/* Badge thông báo */}
                {hasNotifications && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="text-base">
                Thông báo
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Danh sách thông báo hoặc trống */}
              <div className="p-4 text-center text-sm text-muted-foreground">
                Không có thông báo mới
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 py-1 h-auto"
              >
                {/* Avatar */}
                <Avatar className="w-8 h-8">
                  <AvatarImage src={USER_DATA.avatar} alt={USER_DATA.name} />
                  <AvatarFallback className="text-xs">
                    {USER_DATA.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Tên + chevron (ẩn trên mobile) */}
                <div className="hidden sm:flex items-center gap-1">
                  <div className="text-left text-sm">
                    <p className="font-medium line-clamp-1">{USER_DATA.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {USER_DATA.email}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {/* Tên người dùng */}
              <DropdownMenuLabel>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={USER_DATA.avatar} alt={USER_DATA.name} />
                    <AvatarFallback className="text-xs">
                      {USER_DATA.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">
                      {USER_DATA.name}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {USER_DATA.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Menu items */}
              <DropdownMenuItem className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Hồ sơ cá nhân
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Cài đặt
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
