// packages/reactivity/src/effect.ts
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
  if (options) {
    Object.assign(_effect, options);
  }
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
var activeEffect;
var ReactiveEffect = class {
  constructor(fn, scheduler) {
    this._trackId = 0;
    // 用于记录当前effect执行了几次，也能看出执行版本，防止一个属性重复收集
    this._depsLength = 0;
    this._running = 0;
    // 防止effect嵌套执行
    this._dirtyLevel = 4 /* Dirty */;
    // 默认脏值
    this.deps = [];
    this.active = true;
    this.fn = fn;
    this.scheduler = scheduler;
  }
  get dirty() {
    return this._dirtyLevel === 4 /* Dirty */;
  }
  set dirty(val) {
    this._dirtyLevel = val ? 4 /* Dirty */ : 0 /* NoDirty */;
  }
  stop() {
    if (this.active) {
      for (let i = 0; i < this.deps.length; i++) {
        const dep = this.deps[i];
        cleanDepEffect(dep, this);
      }
      this.deps.length = 0;
      this.active = false;
    }
  }
  run() {
    this._dirtyLevel = 0 /* NoDirty */;
    if (!this.active) return this.fn();
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      preCleanEffect(this);
      this._running++;
      if (this._running > 1) return this.fn();
      return this.fn();
    } finally {
      this._running--;
      postCleanEffect(this);
      activeEffect = lastEffect;
    }
  }
};
function trackEffects(effect2, dep) {
  if (dep.get(effect2) === effect2._trackId) return;
  dep.set(effect2, effect2._trackId);
  let oldDep = effect2.deps[effect2._depsLength];
  if (oldDep !== dep) {
    if (oldDep) {
      cleanDepEffect(oldDep, effect2);
    }
    effect2.deps[effect2._depsLength++] = dep;
  } else {
    effect2._depsLength++;
  }
}
function cleanDepEffect(dep, effect2) {
  dep.delete(effect2);
  if (dep.size === 0) {
    dep.cleanUp();
  }
  effect2.deps.splice(effect2._depsLength - 1, 1);
}
function preCleanEffect(effect2) {
  effect2._depsLength = 0;
  effect2._trackId++;
}
function postCleanEffect(effect2) {
  if (effect2.deps.length > effect2._depsLength) {
    for (let i = effect2._depsLength; i < effect2.deps.length; i++) {
      const dep = effect2.deps[i];
      cleanDepEffect(dep, effect2);
    }
    effect2.deps.length = effect2._depsLength;
  }
}
function triggerEffects(dep) {
  for (const effect2 of dep.keys()) {
    if (effect2._dirtyLevel < 4 /* Dirty */) {
      effect2._dirtyLevel = 4 /* Dirty */;
    }
    if (effect2.scheduler && !effect2._running) {
      effect2.scheduler();
    }
  }
}

// packages/shared/src/index.ts
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isFunction(value) {
  return typeof value === "function";
}

// packages/reactivity/src/reactiveEffect.ts
var targetMap = /* @__PURE__ */ new WeakMap();
function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      depsMap = /* @__PURE__ */ new Map();
      targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
      dep = createDep(() => depsMap.delete(key), key);
      depsMap.set(key, dep);
    }
    trackEffects(activeEffect, dep);
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
    let res = Reflect.get(target, key, receiver);
    if (isObject(res)) {
      return reactive(res);
    }
    return res;
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
function toReactive(val) {
  return isObject(val) ? reactive(val) : val;
}
function isReactive(val) {
  return !!(val && val["__v_isReactive" /* IS_REACTIVE */]);
}

// packages/reactivity/src/ref.ts
function ref(value) {
  return createRef(value);
}
function createRef(value) {
  return new RefImpl(value);
}
var RefImpl = class {
  constructor(rawvalue) {
    this.__v_isRef = true;
    this.rawvalue = toReactive(rawvalue);
    this._value = this.rawvalue;
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawvalue) {
      this.rawvalue = newValue;
      this._value = newValue;
      triggerRefValue(this);
    }
  }
};
function trackRefValue(ref2) {
  if (activeEffect) {
    trackEffects(
      activeEffect,
      ref2.dep || (ref2.dep = createDep(() => ref2.dep = void 0, "ref"))
    );
  }
}
function triggerRefValue(ref2) {
  if (ref2.dep) {
    triggerEffects(ref2.dep);
  }
}
var objectRefImpl = class {
  constructor(object, key) {
    this.object = object;
    this.key = key;
    this.__v_isRef = true;
  }
  get value() {
    return this.object[this.key];
  }
  set value(newValue) {
    this.object[this.key] = newValue;
  }
};
function toRef(object, key) {
  return new objectRefImpl(object, key);
}
function toRefs(object) {
  const result = Array.isArray(object) ? new Array(object.length) : {};
  for (let key in object) {
    result[key] = toRef(object, key);
  }
  return result;
}
function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      return res.__v_isRef ? res.value : res;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      if (oldValue.__v_isRef) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    }
  });
}
function isRef(r) {
  return !!(r && r.__v_isRef === true);
}

// packages/reactivity/src/computed.ts
var ComputedRefImpl = class {
  constructor(getter, setter) {
    this.setter = setter;
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {
        triggerRefValue(this);
      }
    );
  }
  get value() {
    if (this.effect.dirty) {
      this._value = this.effect.run();
      trackRefValue(this);
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
};
function computed(getterOrOptions) {
  let isGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  if (isGetter) {
    getter = getterOrOptions;
    setter = () => {
      console.warn("computed value is readonly");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}
export {
  ComputedRefImpl,
  ReactiveEffect,
  activeEffect,
  computed,
  effect,
  isReactive,
  isRef,
  proxyRefs,
  reactive,
  ref,
  toReactive,
  toRef,
  toRefs,
  trackEffects,
  trackRefValue,
  triggerEffects,
  triggerRefValue
};
//# sourceMappingURL=index.js.map
