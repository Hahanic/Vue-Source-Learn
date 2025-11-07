export function patchEvent(el, name, nextValue) {
  const invokers = el!._vei || (el._vei = {});
  const eventName = name.slice(2).toLowerCase();
  const exisitingInvokers = invokers[name]; // 是否存在同名的事件绑定 click -> fn1 / fn2

  // 事件换绑 例：click -> () => fn1() 改成 click -> () => fn2()
  if (nextValue && exisitingInvokers) {
    return (exisitingInvokers.value = nextValue);
  }

  if (nextValue) {
    const invoker = (invokers[name] = createInvoker(nextValue));
    el.addEventListener(eventName, invoker);
  }
  // 现在没有以前有
  if (exisitingInvokers) {
    el.removeEventListener(eventName, exisitingInvokers);
    invokers[name] = undefined;
  }
}

function createInvoker(value) {
  const invoker = (e) => invoker.value();
  invoker.value = value;
  return invoker;
}
