// packages/reactivity/src/effect.ts
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
  return _effect;
}
var activeEffect;
var ReactiveEffect = class {
  constructor(fn, scheduler) {
    this._trackId = 0;
    // 用于记录当前effect执行了几次
    this.deps = [];
    this._depsLength = 0;
    this.active = true;
    this.fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    if (!this.active) return this.fn();
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = lastEffect;
    }
  }
};
function trackEffects(effect2, dep) {
  if (dep.has(effect2)) return;
  dep.set(effect2, effect2._trackId);
  effect2.deps[effect2._depsLength++] = dep;
}
function triggerEffects(dep) {
  for (const effect2 of dep.keys()) {
    if (effect2.scheduler) {
      effect2.scheduler();
    }
  }
}

// packages/shared/src/index.ts
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// packages/reactivity/src/reactiveEffect.ts
var targetMap = /* @__PURE__ */ new WeakMap();
function track(target, key) {
  console.log(target, key);
  console.log(activeEffect);
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      depsMap = /* @__PURE__ */ new Map();
      targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
      dep = /* @__PURE__ */ new Map();
      depsMap.set(key, dep = createDep(() => depsMap.delete(key), key));
    }
    trackEffects(activeEffect, dep);
    console.log(targetMap);
  }
}
var createDep = (cleanUp, key) => {
  const dep = /* @__PURE__ */ new Map();
  dep.cleanUp = cleanUp;
  dep.key = key;
  return dep;
};
function trigger(target, key, value, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (!dep) return;
  triggerEffects(dep);
}

// packages/reactivity/src/baseHandler.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) return true;
    track(target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }
    return result;
  }
};

// packages/reactivity/src/reactive.ts
var reactiveMap = /* @__PURE__ */ new WeakMap();
function reactive(target) {
  return createReactiveObject(target);
}
function createReactiveObject(target) {
  if (!isObject(target)) return target;
  if (target["__v_isReactive" /* IS_REACTIVE */]) return target;
  if (reactiveMap.has(target)) return reactiveMap.get(target);
  let proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}
export {
  ReactiveEffect,
  activeEffect,
  effect,
  reactive,
  trackEffects,
  triggerEffects
};
//# sourceMappingURL=index.js.map
