import { activeEffect } from "./effect";
import { track, trigger } from "./reactiveEffect";

export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    // 如果传入的是个代理对象
    if (key === ReactiveFlags.IS_REACTIVE) return true;

    // 依赖收集
    track(target, key);

    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    // 触发更新
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, receiver);

    if (oldValue !== value) {
      // 触发依赖
      trigger(target, key, value, oldValue);
    }

    return result;
  },
};
