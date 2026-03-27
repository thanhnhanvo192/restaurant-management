import { NavDocuments } from "@/components/layouts/nav-documents";
import { NavUser } from "@/components/layouts/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  CommandIcon,
  LayoutDashboard,
  Table,
  Menu,
  StarOff,
  User2,
  UserCircle2,
  ListOrdered,
} from "lucide-react";

const data = {
  user: {
    name: "Võ Thành Nhân",
    email: "vothanhnhan1902@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  documents: [
    {
      name: "Dashboard",
      url: "#",
      icon: <LayoutDashboard />,
    },
    {
      name: "Quản lý bàn",
      url: "#",
      icon: <Table />,
    },
    {
      name: "Thực đơn",
      url: "#",
      icon: <Menu />,
    },
    {
      name: "Nhân sự",
      url: "#",
      icon: <User2 />,
    },
    {
      name: "Khách hàng",
      url: "#",
      icon: <UserCircle2 />,
    },
    {
      name: "Đơn hàng",
      url: "#",
      icon: <ListOrdered />,
    },
    {
      name: "Thống kê",
      url: "#",
      icon: <StarOff />,
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">Trang quản trị</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavDocuments items={data.documents} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
