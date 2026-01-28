import { z } from "zod";

export const displayModeSchema = z.enum(["card", "table", "chart"]);
export type DisplayMode = z.infer<typeof displayModeSchema>;

export const chartTypeSchema = z.enum(["line", "candlestick", "area"]);
export type ChartType = z.infer<typeof chartTypeSchema>;

export const fieldSchema = z.object({
  path: z.string(),
  label: z.string(),
  type: z.string().optional(),
  format: z.enum(["text", "currency", "percentage", "number"]).optional(),
});
export type Field = z.infer<typeof fieldSchema>;

export const widgetConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  apiUrl: z.string().url(),
  refreshInterval: z.number().min(5).default(30),
  displayMode: displayModeSchema.default("card"),
  chartType: chartTypeSchema.optional(),
  selectedFields: z.array(fieldSchema).default([]),
  lastUpdated: z.string().optional(),
  isLoading: z.boolean().optional(),
  error: z.string().optional(),
  data: z.any().optional(),
});
export type WidgetConfig = z.infer<typeof widgetConfigSchema>;

export const layoutItemSchema = z.object({
  i: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  minW: z.number().optional(),
  minH: z.number().optional(),
  maxW: z.number().optional(),
  maxH: z.number().optional(),
});
export type LayoutItem = z.infer<typeof layoutItemSchema>;

export const dashboardStateSchema = z.object({
  widgets: z.array(widgetConfigSchema),
  layouts: z.object({
    lg: z.array(layoutItemSchema),
    md: z.array(layoutItemSchema).optional(),
    sm: z.array(layoutItemSchema).optional(),
  }),
});
export type DashboardState = z.infer<typeof dashboardStateSchema>;

export const insertWidgetSchema = widgetConfigSchema.omit({ 
  id: true, 
  isLoading: true, 
  error: true, 
  data: true,
  lastUpdated: true 
});
export type InsertWidget = z.infer<typeof insertWidgetSchema>;

export const apiTestRequestSchema = z.object({
  url: z.string().url(),
});
export type ApiTestRequest = z.infer<typeof apiTestRequestSchema>;

export const apiTestResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  fieldCount: z.number().optional(),
});
export type ApiTestResponse = z.infer<typeof apiTestResponseSchema>;
