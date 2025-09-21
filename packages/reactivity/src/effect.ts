import { Dep } from "./reactiveEffect";

export function effect(fn: Function, options?: Object) {
  // 创建响应式effect，数据变化后可以重新执行
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });

  // 默认首先执行一次
  _effect.run();

  if (options) {
    Object.assign(_effect, options);
  }

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;

  return runner;
}

export let activeEffect: ReactiveEffect | undefined;

export class ReactiveEffect {
  _trackId: number = 0; // 用于记录当前effect执行了几次，也能看出执行版本，防止一个属性重复收集
  _depsLength: number = 0;
  _running = 0; // 防止effect嵌套执行
  deps: Dep[] = [];

  public fn: Function;
  public scheduler: Function;
  public active = true;

  constructor(fn: Function, scheduler: Function) {
    this.fn = fn;
    this.scheduler = scheduler;
  }

  run() {
    // 非激活则执行后什么都不用做
    if (!this.active) return this.fn();

    let lastEffect = activeEffect;
    try {
      // 暴露到全局
      activeEffect = this;

      // 为依赖清理做准备
      preCleanEffect(this);

      this._running++;
      // 防止effect嵌套执行
      if (this._running > 1) return this.fn();
      return this.fn();
    } finally {
      this._running--;
      // 清理依赖
      postCleanEffect(this);
      // 确保响应式数据只有在effect被访问才能收集依赖
      activeEffect = lastEffect;
    }
  }
}

// 当前effect和收集器 双向记忆
export function trackEffects(effect: ReactiveEffect, dep: Dep) {
  // 防止同一个属性重复收集
  if (dep.get(effect) === effect._trackId) return;
  dep.set(effect, effect._trackId);

  // 这里靠执行函数里代理对象的属性的访问顺序
  let oldDep = effect.deps[effect._depsLength];
  if (oldDep !== dep) {
    // 如果没有存过
    if (oldDep) {
      // 清理旧的
      cleanDepEffect(oldDep, effect);
    }
    // 换成新的，都是存放本次最新的
    effect.deps[effect._depsLength++] = dep;
  } else {
    effect._depsLength++;
  }
}

// 清理旧的依赖
function cleanDepEffect(dep: Dep, effect: ReactiveEffect) {
  dep.delete(effect);
  // 如果没有依赖了，就从父级中清除
  if (dep.size === 0) {
    dep.cleanUp();
  }
  effect.deps.splice(effect._depsLength - 1, 1);
}

function preCleanEffect(effect: ReactiveEffect) {
  effect._depsLength = 0;
  effect._trackId++; // 每次执行Id加1，如果是同一个effect执行，id就是相同的
}

function postCleanEffect(effect: ReactiveEffect) {
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      const dep = effect.deps[i];
      cleanDepEffect(dep, effect); // 删除映射表对应的effect
    }
    effect.deps.length = effect._depsLength; // 更新依赖列表的长度
  }
}

// 依次执行依赖
export function triggerEffects(dep: Dep) {
  for (const effect of dep.keys()) {
    if (effect.scheduler && !effect._running) {
      effect.scheduler();
    }
  }
}
