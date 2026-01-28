import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDashboardStore } from "@/lib/store";
import type { WidgetConfig, CustomHeader } from "@shared/schema";

async function fetchWidgetData(apiUrl: string, customHeaders?: CustomHeader[]): Promise<unknown> {
  const response = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      url: apiUrl,
      customHeaders: customHeaders && customHeaders.length > 0 ? customHeaders : undefined
    }),
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch data");
  }
  
  return result.data;
}

export function useWidgetData(widget: WidgetConfig) {
  const queryClient = useQueryClient();
  const updateWidget = useDashboardStore(state => state.updateWidget);
  const updateWidgetData = useDashboardStore(state => state.updateWidgetData);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const queryKey = ["widget-data", widget.id, widget.apiUrl, widget.customHeaders];

  const { data, error, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchWidgetData(widget.apiUrl, widget.customHeaders),
    staleTime: (widget.refreshInterval * 1000) / 2,
    gcTime: widget.refreshInterval * 1000 * 2,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (isLoading) {
      updateWidget(widget.id, { isLoading: true, error: undefined });
    }
  }, [isLoading, widget.id, updateWidget]);

  useEffect(() => {
    if (data !== undefined) {
      updateWidgetData(widget.id, data);
    }
  }, [data, widget.id, updateWidgetData]);

  useEffect(() => {
    if (error) {
      updateWidgetData(
        widget.id,
        null,
        error instanceof Error ? error.message : "Network error"
      );
    }
  }, [error, widget.id, updateWidgetData]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (widget.refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        queryClient.invalidateQueries({ queryKey });
      }, widget.refreshInterval * 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [widget.refreshInterval, queryClient, queryKey]);

  return { 
    refetch: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  };
}
