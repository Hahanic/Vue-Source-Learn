import {
  activeEffect,
  trackEffects,
  triggerEffects,
  type ReactiveEffect,
} from "./effect";

// 依赖收集
const targetMap = new WeakMap();

export function track(target: object, key: string | symbol) {
  console.log(target, key);
  console.log(activeEffect);

  if (activeEffect) {
    // 确保targetMap中有target的映射
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      depsMap = new Map();
      targetMap.set(target, depsMap);
    }

    // 确保depsMap中有key的映射
    let dep = depsMap.get(key);
    if (!dep) {
      dep = new Map();
      depsMap.set(key, (dep = createDep(() => depsMap.delete(key), key)));
    }

    // 往key对应的依赖集合添加依赖
    trackEffects(activeEffect, dep);

    console.log(targetMap);
  }
}

// 新建依赖集合时添加key和清理方法
export const createDep = (cleanUp: () => void, key: string | symbol) => {
  const dep = new Map() as any;
  dep.cleanUp = cleanUp;
  dep.key = key;
  return dep;
};

// 触发更新
export function trigger(
  target: object,
  key: string | symbol,
  value: any,
  oldValue: any
) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (!dep) return;

  // 依次执行所有依赖
  triggerEffects(dep);
}
