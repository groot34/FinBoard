import { BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddWidget: () => void;
}

export function EmptyState({ onAddWidget }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted/50 border border-border mb-6">
          <BarChart3 className="w-10 h-10 text-muted-foreground" />
        </div>
        
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Build Your Finance Dashboard
        </h2>
        
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Create custom widgets by connecting to any finance API. Track stocks, crypto, forex, or economic indicators - all in real time.
        </p>

        <Button size="lg" onClick={onAddWidget} data-testid="button-add-first-widget">
          <Plus className="w-5 h-5 mr-2" />
          Add Your First Widget
        </Button>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex flex-col items-center p-4 rounded-lg bg-card border border-border">
            <span className="text-2xl mb-2">1</span>
            <span className="text-muted-foreground text-center">Enter any finance API URL</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-card border border-border">
            <span className="text-2xl mb-2">2</span>
            <span className="text-muted-foreground text-center">Select fields to display</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-card border border-border">
            <span className="text-2xl mb-2">3</span>
            <span className="text-muted-foreground text-center">Watch data update live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
