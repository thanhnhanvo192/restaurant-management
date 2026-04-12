import { CalendarDays } from "lucide-react";

import { cn } from "@/shared/utils";
import { Input } from "@/shared/components/ui/input";

function DateRangePicker({ value, onChange, className }) {
  const handleFromChange = (event) => {
    onChange({
      from: event.target.value,
      to: value?.to ?? "",
    });
  };

  const handleToChange = (event) => {
    onChange({
      from: value?.from ?? "",
      to: event.target.value,
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-background p-2 md:flex-row md:items-center",
        className,
      )}
    >
      <div className="inline-flex items-center gap-2 px-1 text-sm text-muted-foreground">
        <CalendarDays className="size-4" />
        <span>Khoảng ngày</span>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={value?.from ?? ""}
          onChange={handleFromChange}
          className="w-full md:w-42.5"
        />
        <span className="text-sm text-muted-foreground">-</span>
        <Input
          type="date"
          value={value?.to ?? ""}
          onChange={handleToChange}
          className="w-full md:w-42.5"
        />
      </div>
    </div>
  );
}

export { DateRangePicker };
