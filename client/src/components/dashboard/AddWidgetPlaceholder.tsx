import { Plus } from "lucide-react";

interface AddWidgetPlaceholderProps {
  onClick: () => void;
}

export function AddWidgetPlaceholder({ onClick }: AddWidgetPlaceholderProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-full h-full min-h-[200px] rounded-lg border-2 border-dashed border-border bg-card/30 hover:bg-card/50 hover:border-primary/30 transition-all duration-200 cursor-pointer group"
      data-testid="button-add-widget-placeholder"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mb-3">
        <Plus className="w-6 h-6 text-primary" />
      </div>
      <span className="text-sm font-medium text-foreground">Add Widget</span>
      <span className="text-xs text-muted-foreground mt-1 text-center px-4">
        Connect to a finance API and<br />create a custom widget
      </span>
    </button>
  );
}
