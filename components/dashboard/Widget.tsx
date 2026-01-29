import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  RefreshCw, 
  Settings, 
  Trash2, 
  MoreVertical,
  Loader2,
  AlertCircle,
  CreditCard,
  Table2,
  LineChart,
} from "lucide-react";
import { useDashboardStore } from "@/lib/store";
import { useWidgetData } from "@/hooks/use-widget-data";
import { getTimeString } from "@/lib/api-utils";
import { CardDisplay } from "./widget-displays/CardDisplay";
import { TableDisplay } from "./widget-displays/TableDisplay";
import { ChartDisplay } from "./widget-displays/ChartDisplay";
import { WidgetConfigModal } from "./WidgetConfigModal";
import type { WidgetConfig as WidgetConfigType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface WidgetProps {
  widget: WidgetConfigType;
}

const displayModeIcons = {
  card: CreditCard,
  table: Table2,
  chart: LineChart,
};

export function Widget({ widget }: WidgetProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const removeWidget = useDashboardStore(state => state.removeWidget);
  const { refetch } = useWidgetData(widget);

  const DisplayModeIcon = displayModeIcons[widget.displayMode];

  const renderContent = () => {
    if (widget.isLoading && !widget.data) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      );
    }

    if (widget.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-destructive">
          <AlertCircle className="w-8 h-8" />
          <span className="text-sm text-center px-2">{widget.error}</span>
          <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
            <RefreshCw className="w-3 h-3 mr-2" />
            Retry
          </Button>
        </div>
      );
    }

    switch (widget.displayMode) {
      case "table":
        return <TableDisplay widget={widget} />;
      case "chart":
        return <ChartDisplay widget={widget} />;
      default:
        return <CardDisplay widget={widget} />;
    }
  };

  return (
    <>
      <Card 
        className="h-full flex flex-col overflow-hidden"
        data-testid={`widget-${widget.id}`}
      >
        <CardHeader className="flex flex-row items-center justify-between gap-2 py-3 px-4 space-y-0 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <DisplayModeIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <h3 className="font-semibold text-sm truncate">{widget.name}</h3>
            <Badge variant="outline" className="text-[10px] shrink-0">
              {widget.refreshInterval}s
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={refetch}
              disabled={widget.isLoading}
              data-testid={`button-refresh-${widget.id}`}
            >
              <RefreshCw className={cn(
                "w-3.5 h-3.5",
                widget.isLoading && "animate-spin"
              )} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  data-testid={`button-widget-menu-${widget.id}`}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowConfig(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteAlert(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 overflow-auto">
          {renderContent()}
        </CardContent>

        {widget.lastUpdated && (
          <div className="px-4 py-2 border-t border-border/50 bg-muted/30">
            <span className="text-[10px] text-muted-foreground">
              Last updated: {getTimeString(widget.lastUpdated)}
            </span>
          </div>
        )}
      </Card>

      <WidgetConfigModal
        widget={widget}
        open={showConfig}
        onOpenChange={setShowConfig}
      />

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Widget?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{widget.name}" from your dashboard. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeWidget(widget.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
