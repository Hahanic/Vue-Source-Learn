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

function trackRefValue(ref: RefImpl) {
  if (activeEffect) {
    trackEffects(
      activeEffect,
      ref.dep || (ref.dep = createDep(() => (ref.dep = undefined), "ref"))
    );
  }
}

function triggerRefValue(ref: RefImpl) {
  if (ref.dep) {
    triggerEffects(ref.dep);
  }
}
