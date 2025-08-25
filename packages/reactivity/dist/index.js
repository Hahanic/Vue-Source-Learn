// packages/shared/src/index.ts
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// packages/reactivity/src/index.ts
function reactive(target) {
  if (!isObject(target)) {
    console.warn(`reactive() \u671F\u5F85 an object as its argument`);
    return target;
  }
}
export {
  reactive
};
//# sourceMappingURL=index.js.map
