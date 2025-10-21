import { ComputedRefImpl } from "./computed";
import { activeEffect, trackEffects, triggerEffects } from "./effect";
import { toReactive } from "./reactive";
import { createDep } from "./reactiveEffect";

export function ref(value: any) {
  return createRef(value);
}

function createRef(value: any) {
  return new RefImpl(value);
}

class RefImpl {
  __v_isRef = true;
  _value: any;
  rawvalue: any;
  dep: any;
  constructor(rawvalue: any) {
    this.rawvalue = toReactive(rawvalue);
    this._value = this.rawvalue;
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue: any) {
    if (newValue !== this.rawvalue) {
      this.rawvalue = newValue;
      this._value = newValue;
      triggerRefValue(this);
    }
  }
}

// 将 ref 的 value 属性和 effect 进行关联
export function trackRefValue(ref: RefImpl | ComputedRefImpl) {
  if (activeEffect) {
    trackEffects(
      activeEffect,
      ref.dep || (ref.dep = createDep(() => (ref.dep = undefined), "ref"))
    );
  }
}

// 触发 ref 的 value 属性对应的 effect 执行
export function triggerRefValue(ref: RefImpl | ComputedRefImpl) {
  if (ref.dep) {
    triggerEffects(ref.dep);
  }
}

// toRef toRefs
class objectRefImpl {
  __v_isRef = true;
  constructor(public object: any, public key: string) {}
  get value() {
    return this.object[this.key];
  }
  set value(newValue) {
    this.object[this.key] = newValue;
  }
}

export function toRef(object: any, key: string) {
  return new objectRefImpl(object, key);
}

export function toRefs(object: any) {
  const result: any = Array.isArray(object) ? new Array(object.length) : {};
  for (let key in object) {
    result[key] = toRef(object, key);
  }
  return result;
}

export function proxyRefs(objectWithRefs: any) {
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
    },
  });
}

export function isRef(r: any): r is RefImpl {
  return !!(r && r.__v_isRef === true);
}
