import { ShapeFlags } from "@momo-vue/shared";

export function createRenderer(renderOptions) {
  // core 不关心如何渲染

  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp,
  } = renderOptions;

  const mountChildren = (children, container) => {
    children.forEach((child) => {
      patch(null, child, container);
    });
  };

  const mountElement = (vnode, container) => {
    const { type, children, props, shapeFlag } = vnode;

    // 创建好的 DOM 元素
    const el = (vnode.el = hostCreateElement(type));
    // 处理属性
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    // 处理子节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);
    }

    // 将元素插入到容器中
    hostInsert(el, container);
  };

  const patch = (n1, n2, container) => {
    if (n1 === n2) return;

    // 初始渲染
    if (n1 === null) {
      mountElement(n2, container);
    }
  }; // 将虚拟节点插入到容器中，真实渲染

  // 多次调用 render 方法时，会复用上次的 vnode 进行比对更新
  const render = (vnode, container) => {
    patch(container._vnode || null, vnode, container);
    // 保存本次的 vnode 作为下次渲染的参考
    container._vnode = vnode;
  };
  return { render };
}
