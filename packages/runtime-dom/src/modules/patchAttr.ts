export function patchAttr(el: HTMLElement, key: string, value: string) {
  if (value === null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
}
