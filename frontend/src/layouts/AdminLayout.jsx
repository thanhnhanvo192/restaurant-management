import { AppSidebar } from "@/components/layouts/app-sidebar";
import { SiteHeader } from "@/components/layouts/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router";

export default function AdminLayout() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      {/* Phần Sidebar cố định */}
      <AppSidebar variant="inset" />

      <SidebarInset>
        {/* Phần Header cố định */}
        <SiteHeader />

        {/* Phần nội dung thay đổi tùy theo Route */}
        <div className="flex flex-col flex-1">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 md:px-6">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
