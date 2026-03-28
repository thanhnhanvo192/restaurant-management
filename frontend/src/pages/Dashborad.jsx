import { DataTable } from "@/components/layouts/data-table";
import { SectionCards } from "@/components/layouts/section-cards";
import data from "@/data/dashboard.json";

export default function DashboardPage() {
  return (
    <>
      <SectionCards />
      <DataTable data={data} />
    </>
  );
}
