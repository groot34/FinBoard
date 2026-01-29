import { getValueByPath, formatValue } from "@/lib/api-utils";
import type { WidgetConfig } from "@shared/schema";

interface CardDisplayProps {
  widget: WidgetConfig;
}

export function CardDisplay({ widget }: CardDisplayProps) {
  const { data, selectedFields } = widget;

  if (!data || selectedFields.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className="grid gap-3 p-1">
      {selectedFields.map((field, index) => {
        const value = getValueByPath(data, field.path);
        const formattedValue = formatValue(value, field.format);
        
        return (
          <div
            key={field.path}
            className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            data-testid={`card-field-${index}`}
          >
            <span className="text-sm text-muted-foreground">{field.label}</span>
            <span className="text-sm font-semibold text-foreground font-mono">
              {formattedValue}
            </span>
          </div>
        );
      })}
    </div>
  );
}
