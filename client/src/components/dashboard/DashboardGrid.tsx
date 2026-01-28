import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import GridLayout from "react-grid-layout";
import { useDashboardStore } from "@/lib/store";
import { Widget } from "./Widget";
import { AddWidgetPlaceholder } from "./AddWidgetPlaceholder";
import type { LayoutItem } from "@shared/schema";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

type Layout = GridLayout.Layout;

interface DashboardGridProps {
  onAddWidget: () => void;
}

function useContainerWidth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return { containerRef, width };
}

export function DashboardGrid({ onAddWidget }: DashboardGridProps) {
  const { widgets, layouts, updateLayout } = useDashboardStore();
  const { containerRef, width } = useContainerWidth();

  const cols = width > 1200 ? 12 : width > 768 ? 8 : 4;

  const lgLayouts = useMemo(() => {
    const widgetIds = new Set(widgets.map(w => w.id));
    return layouts.lg.filter(l => widgetIds.has(l.i));
  }, [widgets, layouts.lg]);

  const currentLayout = useMemo((): Layout[] => {
    const widgetLayouts = lgLayouts.map(l => ({
      ...l,
      w: Math.min(l.w, cols),
      minW: 2,
      minH: 2,
    }));

    const maxY = widgetLayouts.length > 0 
      ? Math.max(...widgetLayouts.map(l => l.y + l.h))
      : 0;

    const placeholderItem: Layout = {
      i: "add-widget-placeholder",
      x: 0,
      y: maxY,
      w: Math.min(4, cols),
      h: 3,
      static: true,
      isDraggable: false,
      isResizable: false,
    };

    return [...widgetLayouts, placeholderItem];
  }, [lgLayouts, cols]);

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    const filteredLayout = newLayout
      .filter(l => l.i !== "add-widget-placeholder")
      .map(l => ({
        i: l.i,
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
        minW: l.minW,
        minH: l.minH,
      })) as LayoutItem[];

    updateLayout({ lg: filteredLayout });
  }, [updateLayout]);

  return (
    <div ref={containerRef} className="p-6">
      <GridLayout
        className="layout"
        layout={currentLayout}
        cols={cols}
        rowHeight={80}
        width={width - 48}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        onLayoutChange={handleLayoutChange}
        isResizable={true}
        isDraggable={true}
        useCSSTransforms={true}
        compactType="vertical"
        preventCollision={false}
      >
        {widgets.map(widget => (
          <div key={widget.id}>
            <Widget widget={widget} />
          </div>
        ))}
        <div key="add-widget-placeholder">
          <AddWidgetPlaceholder onClick={onAddWidget} />
        </div>
      </GridLayout>
    </div>
  );
}
