import { useState, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useDashboardStore } from "@/lib/store";
import { FieldExplorer } from "./FieldExplorer";
import type { Field, DisplayMode, InsertWidget } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AddWidgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TestStatus = "idle" | "loading" | "success" | "error";

export function AddWidgetModal({ open, onOpenChange }: AddWidgetModalProps) {
  const [name, setName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testData, setTestData] = useState<unknown>(null);
  const [testError, setTestError] = useState<string>("");
  const [fieldCount, setFieldCount] = useState(0);
  const [selectedFields, setSelectedFields] = useState<Field[]>([]);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("card");

  const addWidget = useDashboardStore(state => state.addWidget);
  const { toast } = useToast();

  const resetForm = useCallback(() => {
    setName("");
    setApiUrl("");
    setRefreshInterval(30);
    setTestStatus("idle");
    setTestData(null);
    setTestError("");
    setFieldCount(0);
    setSelectedFields([]);
    setDisplayMode("card");
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const testApi = async () => {
    if (!apiUrl) return;
    
    setTestStatus("loading");
    setTestError("");
    setTestData(null);
    
    try {
      const response = await fetch("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: apiUrl }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTestStatus("success");
        setTestData(result.data);
        setFieldCount(result.fieldCount || 0);
      } else {
        setTestStatus("error");
        setTestError(result.error || "API request failed");
      }
    } catch (error) {
      setTestStatus("error");
      setTestError(error instanceof Error ? error.message : "Network error");
    }
  };

  const handleSubmit = () => {
    if (!name || !apiUrl || selectedFields.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide a name, API URL, and select at least one field.",
        variant: "destructive",
      });
      return;
    }

    const widget: InsertWidget = {
      name,
      apiUrl,
      refreshInterval,
      displayMode,
      selectedFields,
    };

    addWidget(widget);
    
    toast({
      title: "Widget Added",
      description: `"${name}" has been added to your dashboard.`,
    });

    handleOpenChange(false);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Widget</DialogTitle>
          <DialogDescription>
            Connect to any finance API and create a custom widget for your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="widget-name">Widget Name</Label>
            <Input
              id="widget-name"
              placeholder="e.g., Bitcoin Price Tracker"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-widget-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-url">API URL</Label>
            <div className="flex gap-2">
              <Input
                id="api-url"
                placeholder="e.g., https://api.coinbase.com/v2/exchange-rates?currency=BTC"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="flex-1 font-mono text-sm"
                data-testid="input-api-url"
              />
              <Button
                type="button"
                variant="outline"
                onClick={testApi}
                disabled={!apiUrl || !isValidUrl(apiUrl) || testStatus === "loading"}
                data-testid="button-test-api"
              >
                {testStatus === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="ml-2">Test</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Supported: Alpha Vantage, Finnhub, Coinbase, CoinGecko, Binance, Yahoo Finance, Polygon, IEX Cloud, and more.
            </p>
            
            {testStatus === "success" && (
              <div className="flex items-center gap-2 text-sm text-primary mt-2 p-2 rounded-md bg-primary/10 border border-primary/20">
                <CheckCircle2 className="w-4 h-4" />
                <span>API connection successful! {fieldCount} top-level fields found.</span>
              </div>
            )}
            
            {testStatus === "error" && (
              <div className="flex items-center gap-2 text-sm text-destructive mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-4 h-4" />
                <span>{testError}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
            <Input
              id="refresh-interval"
              type="number"
              min={5}
              max={3600}
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Math.max(5, parseInt(e.target.value) || 30))}
              data-testid="input-refresh-interval"
            />
          </div>

          {testStatus === "success" && testData && (
            <div className="space-y-2 pt-4 border-t border-border">
              <Label>Select Fields to Display</Label>
              <FieldExplorer
                data={testData}
                selectedFields={selectedFields}
                onFieldsChange={setSelectedFields}
                displayMode={displayMode}
                onDisplayModeChange={setDisplayMode}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => handleOpenChange(false)} data-testid="button-cancel-widget">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !apiUrl || selectedFields.length === 0}
            data-testid="button-submit-widget"
          >
            Add Widget
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
