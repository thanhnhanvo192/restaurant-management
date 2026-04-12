import { NavDocuments } from "@/shared/components/layout/nav-documents";
import { NavUser } from "@/shared/components/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Menu,
  ListOrdered,
  UserCircle,
} from "lucide-react";

const prefixCustomer = "/customer";

// Dữ liệu sidebar cho khách hàng
const data = {
  user: {
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    avatar: "/avatars/customer.jpg",
  },
  menuItems: [
    {
      name: "Trang chủ",
      url: `${prefixCustomer}/dashboard`,
      icon: <LayoutDashboard />,
    },
    {
      name: "Đặt bàn",
      url: `${prefixCustomer}/booking`,
      icon: <UtensilsCrossed />,
    },
    {
      name: "Thực đơn & Gọi món",
      url: `${prefixCustomer}/menu`,
      icon: <Menu />,
    },
    {
      name: "Lịch sử đơn hàng",
      url: `${prefixCustomer}/orders`,
      icon: <ListOrdered />,
    },
    {
      name: "Thông tin cá nhân",
      url: `${prefixCustomer}/profile`,
      icon: <UserCircle />,
    },
  ],
};

export function CustomerSidebar({ ...props }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Logo nhà hàng */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href={prefixCustomer}>
                {/* Icon nhà hàng */}
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary text-primary-foreground">
                  <UtensilsCrossed className="size-4" />
                </div>
                <span className="text-base font-semibold">Nhà hàng ABC</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Menu điều hướng */}
      <SidebarContent>
        <NavDocuments items={data.menuItems} />
      </SidebarContent>

      {/* Thông tin người dùng */}
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
