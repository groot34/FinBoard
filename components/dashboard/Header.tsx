import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Plus, Download, Upload, Trash2, Zap, Bitcoin, Globe } from "lucide-react";
import { useDashboardStore } from "@/lib/store";
import { QUICK_TEMPLATES } from "@/lib/templates";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  onAddWidget: () => void;
}

export function Header({ onAddWidget }: HeaderProps) {
  const { widgets, addWidget, exportConfig, importConfig, clearDashboard } = useDashboardStore();
  const { toast } = useToast();

  const activeWidgets = widgets.length;

  const availableTemplates = QUICK_TEMPLATES.filter(
    (template) => !widgets.some((w) => w.templateId === template.id)
  );

  const handleAddTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    addWidget(template.config);
    toast({
      title: "Widget Added",
      description: `${template.name} has been added to your dashboard.`,
    });
  };

  const handleExport = () => {
    const config = exportConfig();
    const blob = new Blob([config], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-config-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Configuration Exported",
      description: "Your dashboard configuration has been downloaded.",
    });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const success = importConfig(text);
        if (success) {
          toast({
            title: "Configuration Imported",
            description: "Your dashboard has been restored from the file.",
          });
        } else {
          toast({
            title: "Import Failed",
            description: "The file format is invalid.",
            variant: "destructive",
          });
        }
      }
    };
    input.click();
  };

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-foreground">Groww Assignment</h1>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
            {activeWidgets > 0 ? (
              <>
                <span className="text-foreground font-medium">{activeWidgets}</span>
                {" active widget"}{activeWidgets !== 1 ? "s" : ""}
                {" "}&bull;{" "}Real-time data
              </>
            ) : (
              "Connect to APIs and build your dashboard"
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
        {availableTemplates.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="hidden sm:inline">Quick Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Templates</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableTemplates.map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  onClick={() => handleAddTemplate(template)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {template.icon === "bitcoin" && <Bitcoin className="w-4 h-4 text-orange-500" />}
                    {template.icon === "ethereum" && <div className="w-4 h-4 rounded-full border-2 border-slate-500 flex items-center justify-center text-[10px] font-bold text-slate-500">Ξ</div>}
                    {template.icon === "globe" && <Globe className="w-4 h-4 text-blue-500" />}
                    <div className="flex flex-col">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[140px]">{template.description}</span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {widgets.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-dashboard-menu">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExport} data-testid="button-export-config">
                <Download className="w-4 h-4 mr-2" />
                Export Configuration
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImport} data-testid="button-import-config">
                <Upload className="w-4 h-4 mr-2" />
                Import Configuration
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:text-destructive"
                    data-testid="button-clear-dashboard"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Dashboard
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Dashboard?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all widgets from your dashboard. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={clearDashboard}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <ThemeToggle />
        
        <Button onClick={onAddWidget} data-testid="button-add-widget">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Widget</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </header>
  );
}
