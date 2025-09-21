import {
  activeEffect,
  trackEffects,
  triggerEffects,
  type ReactiveEffect,
} from "./effect";

/**
 * Dep 是一个特殊的 Map，它存储 ReactiveEffect 和其 trackId 的映射。
 * 同时，它还附加了用于清理自身的 cleanUp 方法和对应的 key。
 */
export interface Dep extends Map<ReactiveEffect, number> {
  cleanUp: () => void;
  key: string | symbol;
}
/**
 * DepsMap 存储着一个目标对象的所有属性 key 到其依赖集合 Dep 的映射。
 * Map<key, Dep>
 */
export type DepsMap = Map<string | symbol, Dep>;
/**
 * TargetMap 是最外层的 WeakMap，存储着目标对象到其依赖地图 DepsMap 的映射。
 * WeakMap<target, DepsMap>
 */
export type TargetMap = WeakMap<object, DepsMap>;

// 依赖收集
const targetMap: TargetMap = new WeakMap();

export function track(target: object, key: string | symbol) {
  if (activeEffect) {
    // 确保targetMap中有target的映射
    let depsMap: DepsMap | undefined = targetMap.get(target);
    if (!depsMap) {
      depsMap = new Map();
      targetMap.set(target, depsMap);
    }
    // 确保depsMap中有key的映射
    let dep: Dep | undefined = depsMap.get(key);
    if (!dep) {
      dep = createDep(() => depsMap.delete(key), key);
      depsMap.set(key, dep);
    }

    // 往key对应的依赖集合添加依赖
    trackEffects(activeEffect, dep);

    // console.log(targetMap);
  }
}

// 新建依赖集合时添加key和清理方法
export const createDep = (cleanUp: () => void, key: string | symbol) => {
  const dep = new Map<ReactiveEffect, number>() as Dep;
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
  const depsMap: DepsMap | undefined = targetMap.get(target);
  if (!depsMap) return;

  const dep: Dep | undefined = depsMap.get(key);
  if (!dep) return;

  // 依次执行所有依赖
  triggerEffects(dep);
}
