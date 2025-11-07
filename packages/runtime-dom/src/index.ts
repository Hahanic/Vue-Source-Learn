import { nodeOps } from "./nodeOps";
import patchProp from "./patchProps";

// 将节点操作和属性操作合并
const renderOptions = Object.assign({ patchProp }, nodeOps);

export { renderOptions };
export * from "@vue/reactivity";

// createRenderer(renderOptions).render()
