export function patchClass(el: HTMLElement, value: string | null) {
  if (value === null) {
    el.removeAttribute("class");
  } else {
    el.className = value;
  }
}
