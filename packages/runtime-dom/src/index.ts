import { nodeOps } from "./nodeOps";
import patchProp from "./patchProps";

import { createRenderer } from "@momo-vue/runtime-core";

// 将节点操作和属性操作合并
const renderOptions = Object.assign({ patchProp }, nodeOps);

export { renderOptions };

// 创建渲染器并导出默认的 render 方法
export const render = (vnode, container) => {
  return createRenderer(renderOptions).render(vnode, container);
};

export * from "@momo-vue/runtime-core";
