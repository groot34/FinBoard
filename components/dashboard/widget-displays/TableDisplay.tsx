import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { extractArrayData, extractObjectAsRows, formatValue } from "@/lib/api-utils";
import type { WidgetConfig } from "@shared/schema";
import { cn } from "@/lib/utils";

interface TableDisplayProps {
  widget: WidgetConfig;
}

type SortDirection = "asc" | "desc" | null;

export function TableDisplay({ widget }: TableDisplayProps) {
  const { data, selectedFields } = widget;
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const { tableData, isObjectMode } = useMemo(() => {
    const arrayData = extractArrayData(data, selectedFields);
    if (arrayData.length > 0) {
      return { tableData: arrayData, isObjectMode: false };
    }
    const objectData = extractObjectAsRows(data, selectedFields);
    return { tableData: objectData, isObjectMode: true };
  }, [data, selectedFields]);

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return tableData;
    return [...tableData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const comparison = typeof aVal === "number" && typeof bVal === "number"
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [tableData, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (column: string) => {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else if (sortDirection === "desc") {
      setSortColumn(null);
      setSortDirection(null);
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ChevronsUpDown className="w-3 h-3 opacity-50" />;
    if (sortDirection === "asc") return <ChevronUp className="w-3 h-3" />;
    return <ChevronDown className="w-3 h-3" />;
  };

  if (tableData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No array data found. Select fields from an array for table view.
      </div>
    );
  }

  const columns = isObjectMode ? ["Field", "Value"] : selectedFields.map(f => f.label);

  return (
    <div className="flex flex-col h-full space-y-2">
      <div className="flex items-center justify-between gap-4 px-1">
        <span className="text-xs text-muted-foreground ml-auto">
          {sortedData.length} of {tableData.length} items
        </span>
      </div>

      <ScrollArea className="flex-1 rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead
                  key={column}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{column}</span>
                    {getSortIcon(column)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, i) => (
              <TableRow key={row._index as number} data-testid={`table-row-${i}`}>
                {columns.map(column => (
                  <TableCell key={column} className="text-xs font-mono py-2">
                    {formatValue(row[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="h-7 text-xs"
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="h-7 text-xs"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
