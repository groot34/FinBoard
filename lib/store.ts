import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { WidgetConfig, LayoutItem, DashboardState, InsertWidget, Field } from "@shared/schema";

const DEFAULT_WIDGET_SIZE = { w: 4, h: 3, minW: 2, minH: 2 };

export type Theme = "dark" | "light" | "system";

interface DashboardStore extends DashboardState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  addWidget: (widget: InsertWidget) => string;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  updateWidgetData: (id: string, data: unknown, error?: string) => void;
  updateLayout: (layouts: DashboardState["layouts"]) => void;
  clearDashboard: () => void;
  exportConfig: () => string;
  importConfig: (config: string) => boolean;
}

function getNextPosition(layouts: LayoutItem[]): { x: number; y: number } {
  if (layouts.length === 0) return { x: 0, y: 0 };
  
  const maxY = Math.max(...layouts.map(l => l.y + l.h));
  const itemsAtMaxRow = layouts.filter(l => l.y + l.h === maxY);
  const maxX = Math.max(...itemsAtMaxRow.map(l => l.x + l.w));
  
  if (maxX + DEFAULT_WIDGET_SIZE.w <= 12) {
    return { x: maxX, y: maxY - DEFAULT_WIDGET_SIZE.h };
  }
  return { x: 0, y: maxY };
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      theme: "system",
      widgets: [],
      layouts: { lg: [] },

      setTheme: (theme: Theme) => set({ theme }),

      addWidget: (widgetData: InsertWidget) => {
        const id = uuidv4();
        const widget: WidgetConfig = {
          ...widgetData,
          id,
          isLoading: false,
          error: undefined,
          data: undefined,
          lastUpdated: undefined,
        };

        const position = getNextPosition(get().layouts.lg);
        const layoutItem: LayoutItem = {
          i: id,
          ...position,
          ...DEFAULT_WIDGET_SIZE,
        };

        set(state => ({
          widgets: [...state.widgets, widget],
          layouts: {
            ...state.layouts,
            lg: [...state.layouts.lg, layoutItem],
          },
        }));

        return id;
      },

      removeWidget: (id: string) => {
        set(state => ({
          widgets: state.widgets.filter(w => w.id !== id),
          layouts: {
            ...state.layouts,
            lg: state.layouts.lg.filter(l => l.i !== id),
          },
        }));
      },

      updateWidget: (id: string, updates: Partial<WidgetConfig>) => {
        set(state => ({
          widgets: state.widgets.map(w =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }));
      },

      updateWidgetData: (id: string, data: unknown, error?: string) => {
        set(state => ({
          widgets: state.widgets.map(w =>
            w.id === id
              ? {
                  ...w,
                  data,
                  error,
                  isLoading: false,
                  lastUpdated: new Date().toISOString(),
                }
              : w
          ),
        }));
      },

      updateLayout: (layouts: DashboardState["layouts"]) => {
        set({ layouts });
      },

      clearDashboard: () => {
        set({ widgets: [], layouts: { lg: [] } });
      },

      exportConfig: () => {
        const state = get();
        return JSON.stringify({
          widgets: state.widgets.map(({ data, isLoading, error, lastUpdated, ...rest }) => rest),
          layouts: state.layouts,
          theme: state.theme,
        }, null, 2);
      },

      importConfig: (configStr: string) => {
        try {
          const config = JSON.parse(configStr);
          if (config.widgets && config.layouts) {
            set((state) => ({
              widgets: config.widgets.map((w: Omit<WidgetConfig, "data" | "isLoading" | "error" | "lastUpdated">) => ({
                ...w,
                data: undefined,
                isLoading: false,
                error: undefined,
                lastUpdated: undefined,
              })),
              layouts: config.layouts,
              theme: config.theme || state.theme,
            }));
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "finance-dashboard-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        widgets: state.widgets.map(({ data, isLoading, error, ...rest }) => rest),
        layouts: state.layouts,
        theme: state.theme,
      }),
    }
  )
);
