import { activeEffect } from "./effect";

export function track(target, key) {
  // 依赖收集
  console.log(target, key);
  console.log(activeEffect);
}
