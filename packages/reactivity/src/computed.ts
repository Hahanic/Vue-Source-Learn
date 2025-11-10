import { isFunction } from "@momo-vue/shared";
import { ReactiveEffect } from "./effect";
import { trackRefValue, triggerRefValue } from "./ref";
import { Dep } from "./reactiveEffect";

export class ComputedRefImpl {
  public _value: any;
  public effect: ReactiveEffect;
  public dep: Dep | undefined;
  constructor(getter: Function, public setter: Function) {
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {
        // 依赖的响应式数据变化时触发更新
        triggerRefValue(this);
      }
    );
  }
  get value() {
    // 计算属性的值是缓存的
    if (this.effect.dirty) {
      this._value = this.effect.run();

      // 如果当前在effect中，说明计算属性的值被使用了
      // 需要收集计算属性的依赖
      trackRefValue(this);
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
}

export function computed(getterOrOptions: any) {
  let isGetter = isFunction(getterOrOptions);

  let getter: Function;
  let setter: Function;
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
