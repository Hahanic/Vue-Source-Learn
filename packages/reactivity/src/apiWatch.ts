import { isObject } from "@momo-vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";
import { isRef } from "./ref";

export function watch(source, cb, options = {} as any) {
  return doWatch(source, cb, options);
}

export function watchEffect(source, options = {} as any) {
  return doWatch(() => source, null, options);
}

// 深度遍历对象，触发所有属性的get拦截
function traverse(source, depth, currentDepth = 0, seen = new Set()) {
  // 终点
  if (!isObject(source)) {
    return source;
  }
  // 处理深度遍历的情况
  // 继续触发该响应式对象的get拦截
  if (depth) {
    if (currentDepth <= depth) {
      return source;
    }
    currentDepth++;
  }
  if (seen.has(source)) {
    return source;
  }
  seen.add(source);

  for (const key in source) {
    traverse(source[key], depth, currentDepth, seen);
  }
  return source;
}

function doWatch(source, cb, { deep, immediate }) {
  const reactiveGetter = (source) =>
    traverse(source, deep === false ? 1 : undefined);

  // 产生一个给ReactiveEffect使用的getter，对对象进行取值会关联当前的reactiveEffect
  let getter: () => any;
  if (isReactive(source)) {
    getter = () => reactiveGetter(source);
  } else if (isRef(source)) {
    getter = () => source.value;
  } else if (typeof source === "function") {
    getter = source;
  } else {
    getter = () => {};
  }
  let oldValue: any;

  const job = () => {
    if (cb) {
      const newValue = effect.run();
      cb(newValue, oldValue);
      oldValue = newValue;
    } else {
      effect.run();
    }
  };

  const effect = new ReactiveEffect(getter, job);
  if (cb) {
    // 有回调函数，说明是watch
    if (immediate) {
      job();
    } else {
      oldValue = effect.run();
    }
  } else {
    // watchEffect
    effect.run();
  }

  const unwatch = () => {
    effect.stop();
  };
  return unwatch;
}
