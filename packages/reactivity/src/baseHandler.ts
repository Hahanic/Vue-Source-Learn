import { isObject } from "@vue/shared";
import { activeEffect } from "./effect";
import { track, trigger } from "./reactiveEffect";
import { reactive } from "./reactive";
import { ReactiveFlags } from "./constants";

export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    // 如果传入的是个代理对象
    if (key === ReactiveFlags.IS_REACTIVE) return true;

    // 依赖收集
    track(target, key);

    // target（原始对象）里面方法可能会用到this，所以用Reflect的get方法讲this指向receiver（代理对象）
    let res = Reflect.get(target, key, receiver);
    // 深代理
    if (isObject(res)) {
      // 如果是对象继续代理
      return reactive(res);
    }

    return res;
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
