import { AppSidebar } from "@/components/layouts/app-sidebar";
import { DataTable } from "@/components/layouts/data-table";
import { SectionCards } from "@/components/layouts/section-cards";
import { SiteHeader } from "@/components/layouts/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import data from "@/data/dashboard.json";

export default function Page() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col flex-1">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
