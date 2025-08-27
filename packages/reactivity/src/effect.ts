export function effect(fn: Function, options?: Object) {
  // 创建响应式effect，数据变化后可以重新执行
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });

  // 默认首先执行一次
  _effect.run();

  return _effect;
}

export let activeEffect: ReactiveEffect | undefined;

export class ReactiveEffect {
  _trackId: number = 0; // 用于记录当前effect执行了几次
  deps = [];
  _depsLength: number = 0;

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
      // 依赖收集
      return this.fn();
    } finally {
      // 确保响应式数据只有在effect被访问才能收集依赖
      activeEffect = lastEffect;
    }
  }
}

// 当前effect和收集器 双向记忆
export function trackEffects(effect, dep) {
  if (dep.has(effect)) return;
  dep.set(effect, effect._trackId);
  effect.deps[effect._depsLength++] = dep;
}

// 依次执行依赖
export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    if (effect.scheduler) {
      effect.scheduler();
    }
  }
}
