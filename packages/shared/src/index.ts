export function isObject(value: any) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isFunction(value: any) {
  return typeof value === "function";
}

export * from "./shapeFlags";
