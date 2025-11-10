export const ShapeFlags = {
  // 元素
  ELEMENT: 1,
  "1": "ELEMENT",
  // 函数式组件
  FUNCTIONAL_COMPONENT: 2,
  "2": "FUNCTIONAL_COMPONENT",
  // 有状态组件
  STATEFUL_COMPONENT: 4,
  "4": "STATEFUL_COMPONENT",
  // 文本子节点
  TEXT_CHILDREN: 8,
  "8": "TEXT_CHILDREN",
  // 数组子节点
  ARRAY_CHILDREN: 16,
  "16": "ARRAY_CHILDREN",
  // 插槽子节点
  SLOTS_CHILDREN: 32,
  "32": "SLOTS_CHILDREN",
  // 传送门
  TELEPORT: 64,
  "64": "TELEPORT",
  // 异步组件
  SUSPENSE: 128,
  "128": "SUSPENSE",
  // 组件应该被 keep-alive 包裹
  COMPONENT_SHOULD_KEEP_ALIVE: 256,
  "256": "COMPONENT_SHOULD_KEEP_ALIVE",
  // 组件被 keep-alive 包裹
  COMPONENT_KEPT_ALIVE: 512,
  "512": "COMPONENT_KEPT_ALIVE",
  // 组件
  COMPONENT: 6,
  "6": "COMPONENT",
};
