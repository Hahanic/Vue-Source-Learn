import { isObject } from "@vue/shared";

export function reactive(target) {
  if (!isObject(target)) {
    console.warn(`reactive() expects an object as its argument`);
    return target;
  }
  // ...
}
