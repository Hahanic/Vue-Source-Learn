import { isString, ShapeFlags } from "@momo-vue/shared";

export function isVnode(value) {
  return value?.__v_isVnode;
}

export function createVnode(type, props?, children?) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
  const vnode = {
    __v_isVnode: true,
    type,
    props,
    children,
    key: props?.key, // 用于 diff 算法优化
    el: null, // 真实 DOM 元素的引用
    shapeFlag,
  };

  if (children) {
    if (Array.isArray(children)) {
      vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    } else {
      children = String(children);
      vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
  }

  return vnode;
}
