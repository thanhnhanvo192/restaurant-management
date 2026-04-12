import { memo } from "react";

import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

const TableList = ({
  paginatedTables,
  selectedTableIds,
  selectedCount,
  isDeleting,
  isAllCurrentPageSelected,
  rowStatusOptions,
  onToggleSelectAllInCurrentPage,
  onToggleSelectTable,
  onStatusUpdate,
  onEdit,
  onDelete,
  onBulkDelete,
}) => {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Đã chọn {selectedCount} bàn.
        </p>
        <Button
          variant="destructive"
          onClick={onBulkDelete}
          disabled={selectedCount === 0 || isDeleting}
        >
          {isDeleting ? "Đang xoá..." : "Xoá nhiều bàn"}
        </Button>
      </div>

      <div className="overflow-hidden border rounded-lg">
        <UITable>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={isAllCurrentPageSelected}
                  onCheckedChange={(checked) =>
                    onToggleSelectAllInCurrentPage(checked === true)
                  }
                  aria-label="Chon tat ca ban trong trang"
                />
              </TableHead>
              <TableHead className="w-28">Số bàn</TableHead>
              <TableHead>Khu vực</TableHead>
              <TableHead className="w-28">Sức chứa</TableHead>
              <TableHead className="w-48">Trạng thái</TableHead>
              <TableHead className="w-44">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedTables.length > 0 ? (
              paginatedTables.map((table) => (
                <TableRow key={table.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTableIds.includes(table.id)}
                      onCheckedChange={(checked) =>
                        onToggleSelectTable(table.id, checked === true)
                      }
                      aria-label={`Chon ban ${table.tableNumber}`}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{table.tableNumber}</span>
                  </TableCell>
                  <TableCell>{table.area}</TableCell>
                  <TableCell>{table.capacity} Khách</TableCell>
                  <TableCell>
                    <Select
                      value={table.status}
                      onValueChange={(value) => onStatusUpdate(table.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chon trang thai" />
                      </SelectTrigger>
                      <SelectContent>
                        {rowStatusOptions.map((statusOption) => (
                          <SelectItem
                            key={statusOption.value}
                            value={statusOption.value}
                          >
                            {statusOption.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(table)}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={() => onDelete(table.id)}
                      >
                        Xoá
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  Khong co ban an phu hop voi bo loc hien tai.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UITable>
      </div>
    </>
  );
};

export default memo(TableList);
