import { isObject } from "@momo-vue/shared";
import { createVnode, isVnode } from "./createVnode";

export function h(type, propsOrChildren?, children?) {
  let l = arguments.length;
  if (l === 2) {
    // 两个参数
    // 第二个参数可能是属性也可能是子节点
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      // 虚拟节点
      if (isVnode(propsOrChildren)) {
        return createVnode(type, null, [propsOrChildren]);
      } else {
        // 属性
        return createVnode(type, propsOrChildren);
      }
    }
    // 子节点数组或文本
    return createVnode(type, null, propsOrChildren);
  } else {
    // 多于两个参数，第三个及后续参数均为子节点
    if (l > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    }
    if (l === 3 && isVnode(children)) {
      children = [children];
    }
    return createVnode(type, propsOrChildren, children);
  }
}
