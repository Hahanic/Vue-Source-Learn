import { isObject } from "@vue/shared";
import { mutableHandlers, ReactiveFlags } from "./baseHandler";

const reactiveMap = new WeakMap<object, any>();

export function reactive(target: object) {
  return createReactiveObject(target);
}

// 创建响应式对象
function createReactiveObject(target: object) {
  // 判断是否为对象
  if (!isObject(target)) return target;

  // 判断是否是代理对象
  if (target[ReactiveFlags.IS_REACTIVE]) return target;

  // 判断是否已被代理
  if (reactiveMap.has(target)) return reactiveMap.get(target);

  let proxy = new Proxy(target, mutableHandlers);
  // 记录对象和代理
  reactiveMap.set(target, proxy);
  return proxy;
}
