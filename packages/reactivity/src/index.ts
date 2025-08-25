import { isObject } from "@vue/shared";

export function reactive(target) {
  if (!isObject(target)) {
    console.warn(`reactive() 期待 an object as its argument`);
    return target;
  }
}
