import { NavDocuments } from "@/shared/components/layout/nav-documents";
import { NavUser } from "@/shared/components/layout/nav-user";
import api from "@/services/api/client";
import {
  clearAdminSession,
  getAdminAuthHeaders,
  getAdminProfileCache,
  getAdminRefreshToken,
} from "@/services/admin-session";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
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
  CommandIcon,
  LayoutDashboard,
  Table,
  Menu,
  StarOff,
  User2,
  UserCircle2,
  ListOrdered,
} from "lucide-react";

const prefixAdmin = "/admin";

const data = {
  documents: [
    {
      name: "Dashboard",
      url: `${prefixAdmin}/dashboard`,
      icon: <LayoutDashboard />,
    },
    {
      name: "Quản lý bàn",
      url: `${prefixAdmin}/tables`,
      icon: <Table />,
    },
    {
      name: "Thực đơn",
      url: `${prefixAdmin}/menu`,
      icon: <Menu />,
    },
    {
      name: "Nhân sự",
      url: `${prefixAdmin}/staff`,
      icon: <User2 />,
    },
    {
      name: "Khách hàng",
      url: `${prefixAdmin}/customers`,
      icon: <UserCircle2 />,
    },
    {
      name: "Đơn hàng",
      url: `${prefixAdmin}/orders`,
      icon: <ListOrdered />,
    },
    {
      name: "Thống kê",
      url: `${prefixAdmin}/reports`,
      icon: <StarOff />,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const navigate = useNavigate();
  const cachedAdmin = getAdminProfileCache();

  const user = useMemo(
    () => ({
      name: cachedAdmin?.fullName || "Admin",
      email: cachedAdmin?.email || "",
      avatar: "/avatars/shadcn.jpg",
    }),
    [cachedAdmin?.email, cachedAdmin?.fullName],
  );

  const handleLogout = async () => {
    try {
      await api.post(
        "/auth/admin/logout",
        {
          refreshToken: getAdminRefreshToken(),
        },
        {
          headers: getAdminAuthHeaders(),
        },
      );
    } catch {
      // Ignore logout API errors and clear local session anyway.
    } finally {
      clearAdminSession();
      toast.success("Da dang xuat");
      navigate("/admin/login", { replace: true });
    }
  };

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
        <NavUser user={user} onLogout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  );
}
