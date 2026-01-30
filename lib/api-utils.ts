import type { Field } from "@shared/schema";

const PATH_SEP = "~>";

function isTimeSeriesObject(obj: Record<string, unknown>): boolean {
  const keys = Object.keys(obj);
  if (keys.length < 2) return false;
  const datePattern = /^\d{4}-\d{2}-\d{2}/;
  return keys.every(key => datePattern.test(key));
}

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
          const fullPath = prefix ? `${prefix}[0]${PATH_SEP}${key}` : `[0]${PATH_SEP}${key}`;
          const val = (sampleItem as Record<string, unknown>)[key];
          result[fullPath] = { value: val, type: typeof val };
        });
      }
    } else {
      result[prefix || "data"] = { value: obj, type: "array" };
    }
    return result;
  }

  const objRecord = obj as Record<string, unknown>;
  
  if (isTimeSeriesObject(objRecord)) {
    result[prefix || "data"] = { value: objRecord, type: "timeseries" };
    const firstKey = Object.keys(objRecord)[0];
    const sampleItem = objRecord[firstKey];
    if (sampleItem && typeof sampleItem === "object") {
      result[`${prefix}[0]${PATH_SEP}date`] = { value: firstKey, type: "string" };
      Object.keys(sampleItem as Record<string, unknown>).forEach(itemKey => {
        const itemPath = `${prefix}[0]${PATH_SEP}${itemKey}`;
        const itemVal = (sampleItem as Record<string, unknown>)[itemKey];
        result[itemPath] = { value: itemVal, type: typeof itemVal };
      });
    }
    return result;
  }

  Object.entries(objRecord).forEach(([key, value]) => {
    const newPrefix = prefix ? `${prefix}${PATH_SEP}${key}` : key;
    
    if (value === null || value === undefined) {
      result[newPrefix] = { value, type: "null" };
    } else if (typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newPrefix));
    } else if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === "object") {
        result[newPrefix] = { value, type: "array" };
        if (value[0]) {
          Object.keys(value[0]).forEach(itemKey => {
            const itemPath = `${newPrefix}[0]${PATH_SEP}${itemKey}`;
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
  
  const normalizedPath = path.replace(/\[(\d+)\]/g, `${PATH_SEP}$1`);
  const keys = normalizedPath.split(PATH_SEP);
  let result: unknown = obj;
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!key) continue;
    if (result === null || result === undefined) return undefined;
    if (typeof result !== "object") return undefined;
    
    const objRecord = result as Record<string, unknown>;
    
    if (key in objRecord) {
      result = objRecord[key];
    } else if (/^\d+$/.test(key)) {
      if (Array.isArray(result)) {
        const index = parseInt(key, 10);
        result = result[index];
      } else {
        const objKeys = Object.keys(objRecord);
        const datePattern = /^\d{4}-\d{2}-\d{2}/;
        if (objKeys.length > 0 && datePattern.test(objKeys[0])) {
          const index = parseInt(key, 10);
          const dateKey = objKeys[index];
          if (dateKey) {
            result = objRecord[dateKey];
          } else {
            return undefined;
          }
        } else {
          return undefined;
        }
      }
    } else {
      return undefined;
    }
  }
  
  return result;
}

export function formatValue(value: unknown, format?: Field["format"]): string {
  if (value === null || value === undefined) return "-";
  
  if (Array.isArray(value)) {
    if (value.length === 0) return "0 items";
    if (typeof value[0] === "object") {
      return `${value.length} items (use Table view)`;
    }
    return value.slice(0, 5).join(", ") + (value.length > 5 ? "..." : "");
  }
  
  if (typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>);
    if (keys.length <= 3) {
      const entries = keys.map(k => {
        const v = (value as Record<string, unknown>)[k];
        return `${k}: ${typeof v === "object" ? "[...]" : v}`;
      });
      return entries.join(", ");
    }
    return `${keys.length} fields`;
  }
  
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  switch (format) {
    case "currency":
      if (typeof numValue === "number" && !isNaN(numValue)) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 20, // Max precision for crypto/forex updates
        }).format(numValue);
      }
      return String(value);
    
    case "percentage":
      if (typeof numValue === "number" && !isNaN(numValue)) {
        return `${numValue.toFixed(4)}%`; // Increased to 4 for consistency
      }
      return String(value);
    
    case "number":
      if (typeof numValue === "number" && !isNaN(numValue)) {
        return new Intl.NumberFormat("en-US", {
          maximumFractionDigits: 20,
        }).format(numValue);
      }
      return String(value);
    
    default:
      if (typeof numValue === "number" && !isNaN(numValue)) {
        return new Intl.NumberFormat("en-US", {
          maximumFractionDigits: 20,
        }).format(numValue);
      }
      return String(value);
  }
}

function convertTimeSeriesObjectToArray(obj: Record<string, unknown>): { data: unknown[]; dateField: string } | null {
  const keys = Object.keys(obj);
  if (keys.length < 2) return null;
  
  const datePattern = /^\d{4}-\d{2}-\d{2}/;
  const allDates = keys.every(key => datePattern.test(key));
  
  if (allDates) {
    const data = keys.map(dateKey => ({
      date: dateKey,
      ...(obj[dateKey] as Record<string, unknown>),
    }));
    return { data, dateField: "date" };
  }
  
  return null;
}

export function extractArrayData(data: unknown, fields: Field[]): Record<string, unknown>[] {
  if (!data || !fields.length) return [];
  
  const arrayField = fields.find(f => f.path.includes("[0]"));
  if (arrayField) {
    let arrayPath = arrayField.path.split("[0]")[0];
    if (arrayPath.endsWith(PATH_SEP)) arrayPath = arrayPath.slice(0, -PATH_SEP.length);
    let arrayData = arrayPath ? getValueByPath(data, arrayPath) : data;
    
    if (arrayData && typeof arrayData === "object" && !Array.isArray(arrayData)) {
      const converted = convertTimeSeriesObjectToArray(arrayData as Record<string, unknown>);
      if (converted) {
        arrayData = converted.data;
      }
    }
    
    if (Array.isArray(arrayData)) {
      return arrayData.map((item, index) => {
        const row: Record<string, unknown> = { _index: index };
        fields.forEach(field => {
          let fieldPath = field.path.includes("[0]")
            ? field.path.split(`[0]${PATH_SEP}`)[1]
            : field.path;
          if (fieldPath) {
            const datePattern = /^\d{4}-\d{2}-\d{2}/;
            const parts = fieldPath.split(PATH_SEP);
            if (parts.length > 0 && datePattern.test(parts[0])) {
              fieldPath = parts.slice(1).join(PATH_SEP);
            }
          }
          if (fieldPath === "date") {
            row[field.label] = (item as Record<string, unknown>).date;
          } else if (fieldPath) {
            row[field.label] = (item as Record<string, unknown>)[fieldPath];
          } else {
            row[field.label] = item;
          }
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

export function extractObjectAsRows(data: unknown, fields: Field[]): Record<string, unknown>[] {
  if (!data || !fields.length) return [];
  
  const rows: Record<string, unknown>[] = [];
  
  fields.forEach((field, index) => {
    const value = getValueByPath(data, field.path);
    if (value !== undefined) {
      rows.push({
        _index: index,
        Field: field.label,
        Value: value,
      });
    }
  });
  
  return rows;
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
