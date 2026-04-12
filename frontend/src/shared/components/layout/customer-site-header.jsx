import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Button } from "@/shared/components/ui/button";
import { Bell, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export function CustomerSiteHeader() {
  const handleLogout = () => {
    // TODO: Gọi API logout
    console.log("Logout");
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      {/* Phần trái: SidebarTrigger + Tiêu đề trang */}
      <div className="flex items-center w-full gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Khách hàng</h1>
      </div>

      {/* Phần phải: Thông báo + Đăng xuất */}
      <div className="flex items-center gap-2 px-4 lg:px-6">
        {/* Nút thông báo */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
              {/* Badge thông báo (tùy chọn) */}
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="p-4">
              <h2 className="font-semibold mb-3">Thông báo</h2>
              <DropdownMenuItem
                disabled
                className="text-muted-foreground text-center py-4"
              >
                Không có thông báo mới
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Nút đăng xuất */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Đăng xuất"
        >
          <LogOut className="size-5" />
        </Button>
      </div>
    </header>
  );
}
