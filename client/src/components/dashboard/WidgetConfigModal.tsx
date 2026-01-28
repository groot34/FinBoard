import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardStore } from "@/lib/store";
import type { WidgetConfig, DisplayMode } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Table2, LineChart } from "lucide-react";

interface WidgetConfigModalProps {
  widget: WidgetConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const displayModes = [
  { value: "card" as const, label: "Card", icon: CreditCard },
  { value: "table" as const, label: "Table", icon: Table2 },
  { value: "chart" as const, label: "Chart", icon: LineChart },
];

export function WidgetConfigModal({
  widget,
  open,
  onOpenChange,
}: WidgetConfigModalProps) {
  const [name, setName] = useState(widget.name);
  const [apiUrl, setApiUrl] = useState(widget.apiUrl);
  const [refreshInterval, setRefreshInterval] = useState(widget.refreshInterval);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(widget.displayMode);

  const updateWidget = useDashboardStore(state => state.updateWidget);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setName(widget.name);
      setApiUrl(widget.apiUrl);
      setRefreshInterval(widget.refreshInterval);
      setDisplayMode(widget.displayMode);
    }
  }, [open, widget]);

  const handleSave = () => {
    if (!name || !apiUrl) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and API URL.",
        variant: "destructive",
      });
      return;
    }

    const urlChanged = apiUrl !== widget.apiUrl;
    
    updateWidget(widget.id, {
      name,
      apiUrl,
      refreshInterval,
      displayMode,
      ...(urlChanged ? { data: undefined, error: undefined } : {}),
    });

    toast({
      title: "Widget Updated",
      description: `"${name}" has been updated.`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Widget</DialogTitle>
          <DialogDescription>
            Update widget settings, API endpoint, and display preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="config-name">Widget Name</Label>
            <Input
              id="config-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-config-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="config-url">API URL</Label>
            <Input
              id="config-url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="font-mono text-sm"
              data-testid="input-config-url"
            />
            <p className="text-xs text-muted-foreground">
              Changing the URL will clear current data and refetch.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="config-interval">Refresh Interval (seconds)</Label>
            <Input
              id="config-interval"
              type="number"
              min={5}
              max={3600}
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Math.max(5, parseInt(e.target.value) || 30))}
              data-testid="input-config-interval"
            />
          </div>

          <div className="space-y-2">
            <Label>Display Mode</Label>
            <div className="flex gap-2">
              {displayModes.map(mode => (
                <Button
                  key={mode.value}
                  type="button"
                  variant={displayMode === mode.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDisplayMode(mode.value)}
                  className="flex-1"
                  data-testid={`button-config-mode-${mode.value}`}
                >
                  <mode.icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-config">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
