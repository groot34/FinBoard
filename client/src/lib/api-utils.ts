import type { Field } from "@shared/schema";

export function flattenObject(obj: unknown, prefix = ""): Record<string, { value: unknown; type: string }> {
  const result: Record<string, { value: unknown; type: string }> = {};
  
  if (obj === null || obj === undefined) {
    return result;
  }

  if (typeof obj !== "object") {
    result[prefix || "value"] = { value: obj, type: typeof obj };
    return result;
  }

  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === "object") {
      result[prefix || "data"] = { value: obj, type: "array" };
      if (obj[0]) {
        const sampleItem = obj[0];
        Object.keys(sampleItem).forEach(key => {
          const fullPath = prefix ? `${prefix}[0].${key}` : `[0].${key}`;
          const val = (sampleItem as Record<string, unknown>)[key];
          result[fullPath] = { value: val, type: typeof val };
        });
      }
    } else {
      result[prefix || "data"] = { value: obj, type: "array" };
    }
    return result;
  }

  Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    
    if (value === null || value === undefined) {
      result[newPrefix] = { value, type: "null" };
    } else if (typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newPrefix));
    } else if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === "object") {
        result[newPrefix] = { value, type: "array" };
        if (value[0]) {
          Object.keys(value[0]).forEach(itemKey => {
            const itemPath = `${newPrefix}[0].${itemKey}`;
            const itemVal = (value[0] as Record<string, unknown>)[itemKey];
            result[itemPath] = { value: itemVal, type: typeof itemVal };
          });
        }
      } else {
        result[newPrefix] = { value, type: "array" };
      }
    } else {
      result[newPrefix] = { value, type: typeof value };
    }
  });

  return result;
}

export function getValueByPath(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  
  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let result: unknown = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) return undefined;
    if (typeof result !== "object") return undefined;
    result = (result as Record<string, unknown>)[key];
  }
  
  return result;
}

export function formatValue(value: unknown, format?: Field["format"]): string {
  if (value === null || value === undefined) return "-";
  
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  switch (format) {
    case "currency":
      if (typeof numValue === "number" && !isNaN(numValue)) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(numValue);
      }
      return String(value);
    
    case "percentage":
      if (typeof numValue === "number" && !isNaN(numValue)) {
        return `${numValue.toFixed(2)}%`;
      }
      return String(value);
    
    case "number":
      if (typeof numValue === "number" && !isNaN(numValue)) {
        return new Intl.NumberFormat("en-US", {
          maximumFractionDigits: 6,
        }).format(numValue);
      }
      return String(value);
    
    default:
      if (typeof value === "number") {
        return new Intl.NumberFormat("en-US", {
          maximumFractionDigits: 6,
        }).format(value);
      }
      return String(value);
  }
}

export function extractArrayData(data: unknown, fields: Field[]): Record<string, unknown>[] {
  if (!data || !fields.length) return [];
  
  const arrayField = fields.find(f => f.path.includes("[0]"));
  if (arrayField) {
    const arrayPath = arrayField.path.split("[0]")[0];
    const arrayData = arrayPath ? getValueByPath(data, arrayPath) : data;
    
    if (Array.isArray(arrayData)) {
      return arrayData.map((item, index) => {
        const row: Record<string, unknown> = { _index: index };
        fields.forEach(field => {
          const fieldPath = field.path.includes("[0]")
            ? field.path.split("[0].")[1]
            : field.path;
          row[field.label] = fieldPath ? getValueByPath(item, fieldPath) : item;
        });
        return row;
      });
    }
  }
  
  if (Array.isArray(data)) {
    return data.map((item, index) => {
      const row: Record<string, unknown> = { _index: index };
      fields.forEach(field => {
        row[field.label] = getValueByPath(item, field.path);
      });
      return row;
    });
  }
  
  return [];
}

export function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  
  if (diffSecs < 60) return `${diffSecs}s ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function getTimeString(isoString?: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
