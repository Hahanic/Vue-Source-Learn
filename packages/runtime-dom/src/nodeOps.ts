export const nodeOps = {
  // 如果第三个元素不传递 那就等价于appendChild
  insert(el: HTMLElement, parent: HTMLElement, anchor) {
    parent.insertBefore(el, anchor || null);
  },
  remove(el: HTMLElement) {
    const parent = el.parentNode;
    parent && parent.removeChild(el);
  },
  createElement(tag: string) {
    return document.createElement(tag);
  },
  createText(text: string) {
    return document.createTextNode(text);
  },
  setText(node: Node, text: string) {
    return (node.nodeValue = text);
  },
  setElementText(el: HTMLElement, text: string) {
    return (el.textContent = text);
  },
  parentNode(node: Node) {
    return node.parentNode;
  },
  nextSibling(node: Node) {
    return node.nextSibling;
  },
};
