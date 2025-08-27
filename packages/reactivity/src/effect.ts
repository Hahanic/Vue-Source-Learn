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

class ReactiveEffect {
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
