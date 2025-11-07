export function patchStyle(
  el: HTMLElement,
  preValue: CSSStyleDeclaration | null,
  nextValue: CSSStyleDeclaration | null
) {
  let style = el.style;

  // 新样式
  for (let key in nextValue) {
    style[key] = nextValue[key];
  }
  // 旧样式
  if (preValue) {
    for (let key in preValue) {
      if (nextValue[key] === null) {
        style[key] = null;
      }
    }
  }
}
