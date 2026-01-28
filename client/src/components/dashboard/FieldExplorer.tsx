import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, X, Table2, CreditCard, LineChart } from "lucide-react";
import { flattenObject } from "@/lib/api-utils";
import type { Field, DisplayMode } from "@shared/schema";
import { cn } from "@/lib/utils";

interface FieldExplorerProps {
  data: unknown;
  selectedFields: Field[];
  onFieldsChange: (fields: Field[]) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
}

const displayModes = [
  { value: "card" as const, label: "Card", icon: CreditCard },
  { value: "table" as const, label: "Table", icon: Table2 },
  { value: "chart" as const, label: "Chart", icon: LineChart },
];

export function FieldExplorer({
  data,
  selectedFields,
  onFieldsChange,
  displayMode,
  onDisplayModeChange,
}: FieldExplorerProps) {
  const [search, setSearch] = useState("");
  const [showArraysOnly, setShowArraysOnly] = useState(false);

  const flattenedData = useMemo(() => flattenObject(data), [data]);
  
  const filteredFields = useMemo(() => {
    return Object.entries(flattenedData)
      .filter(([path, { type }]) => {
        const matchesSearch = path.toLowerCase().includes(search.toLowerCase());
        const matchesArrayFilter = !showArraysOnly || type === "array";
        return matchesSearch && matchesArrayFilter;
      })
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [flattenedData, search, showArraysOnly]);

  const isFieldSelected = (path: string) => 
    selectedFields.some(f => f.path === path);

  const toggleField = (path: string, type: string, value: unknown) => {
    if (isFieldSelected(path)) {
      onFieldsChange(selectedFields.filter(f => f.path !== path));
    } else {
      const parts = path.split("~>").filter(p => p && !p.match(/^\[\d+\]$/));
      let label: string;
      if (parts.length >= 2) {
        label = `${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
      } else if (parts.length === 1) {
        label = parts[0];
      } else {
        label = path;
      }
      onFieldsChange([
        ...selectedFields,
        { path, label, type },
      ]);
    }
  };

  const removeField = (path: string) => {
    onFieldsChange(selectedFields.filter(f => f.path !== path));
  };

  const formatPreview = (value: unknown): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return `[${value.length} items]`;
      }
      return "{...}";
    }
    const str = String(value);
    return str.length > 30 ? str.slice(0, 30) + "..." : str;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Display Mode</label>
        <div className="flex gap-2">
          {displayModes.map(mode => (
            <Button
              key={mode.value}
              type="button"
              variant={displayMode === mode.value ? "default" : "outline"}
              size="sm"
              onClick={() => onDisplayModeChange(mode.value)}
              className="flex-1"
              data-testid={`button-display-mode-${mode.value}`}
            >
              <mode.icon className="w-4 h-4 mr-2" />
              {mode.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Search Fields</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-fields"
          />
        </div>
      </div>

      {displayMode === "table" && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-arrays"
            checked={showArraysOnly}
            onCheckedChange={(checked) => setShowArraysOnly(!!checked)}
          />
          <label htmlFor="show-arrays" className="text-sm text-muted-foreground cursor-pointer">
            Show arrays only (for table view)
          </label>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Available Fields</label>
        <ScrollArea className="h-[200px] rounded-md border border-border bg-muted/30">
          <div className="p-2 space-y-1">
            {filteredFields.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No fields found
              </p>
            ) : (
              filteredFields.map(([path, { value, type }]) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => toggleField(path, type, value)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-left transition-colors",
                    isFieldSelected(path)
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted"
                  )}
                  data-testid={`button-field-${path.replace(/\./g, "-")}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-foreground truncate">
                        {path}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {type}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono truncate block">
                      {formatPreview(value)}
                    </span>
                  </div>
                  <Plus className={cn(
                    "w-4 h-4 shrink-0 transition-transform",
                    isFieldSelected(path) && "rotate-45 text-primary"
                  )} />
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {selectedFields.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Selected Fields ({selectedFields.length})
          </label>
          <div className="flex flex-wrap gap-2 p-3 rounded-md border border-border bg-muted/30">
            {selectedFields.map(field => (
              <Badge
                key={field.path}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                <span className="font-mono text-xs">{field.label}</span>
                <button
                  type="button"
                  onClick={() => removeField(field.path)}
                  className="ml-1 p-0.5 rounded hover:bg-background/50"
                  data-testid={`button-remove-field-${field.path.replace(/\./g, "-")}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
