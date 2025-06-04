import { createDom } from "./createDom";
import { dfs } from "./utils/dfs";
import { Fiber, Element, TagEnum } from "./types";
import { updateDom } from "./updateDom";

/** 当前fiber树根节点 */
var wipRoot: Fiber | null = null;

/** 生效中的fiber树根节点*/
var currentRoot: Fiber | null = null;

/** 下一个 render 的工作单元 */
let nextUnitOfWork: Fiber | null = null;

/** 是否暂停当前render */
let shouldYield = false;

/** 需要删除的fiber列表 */
let deletions: Fiber[] = [];

/** 当前处理的 function类型的 fiber 节点 */
let wipFiber: Fiber | null = null;

/** 当前处理的 hook 索引 */
let hookIndex = 0;

const useState = (initial) => {
  // find the hook we last called in this fiber
  const oldHook = wipFiber.alternate?.hooks?.[hookIndex];
  // new wip hook
  const hook = {
    state: oldHook?.state ?? initial,
    queue: [],
  };

  // 重新计算state
  const actions = oldHook?.queue ?? [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  const setState = (action) => {
    // 将action放入更新队列
    hook.queue.push(action);
    // 重新渲染
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    requestIdleCallback(workLoop);
  };

  wipFiber.hooks.push(hook);
  hookIndex++;

  return [state, setState];
};

const commitRoot = () => {
  console.log("进入commit 阶段");
  // 递归将fiber树中的dom节点添加到dom树中
  commitWork(wipRoot?.child);
  // 清空需要删除的fiber列表
  deletions = [];
  // 清空下一个 render 的工作单元
  nextUnitOfWork = null;
  currentRoot = wipRoot;
  wipRoot = null;
};

const commitWork = (fiber?: Fiber) => {
  if (!fiber && fiber?.parent) {
    return;
  }
  let parentFiber = fiber?.parent;
  while (!parentFiber?.dom) {
    parentFiber = parentFiber?.parent;
  }
  switch (fiber.effectTag) {
    case TagEnum.PLACEMENT:
      // 新增dom节点
      if (parentFiber?.dom) {
        parentFiber.dom.appendChild(fiber.dom);
      }
      break;
    case TagEnum.UPDATE:
      // 更新dom节点属性
      updateDom(fiber?.dom, fiber?.alternate?.props, fiber?.props);
      break;
    case TagEnum.DELETION:
      // 删除dom节点
      let temp = fiber;
      while (!temp?.dom) {
        temp = temp?.child;
      }
      if (parentFiber?.dom) {
        parentFiber.dom.removeChild(temp.dom);
      }
      break;
    default:
      break;
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
};

/**
  1. add dom node
  2. create fibers of children
  3. return next unit of work
 * @param fiber 当前fiber
 * @returns 下一个工作单元
 */
const performUnitOfWork = (fiber: Fiber): Fiber => {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    wipFiber = fiber;
    hookIndex = 0;
    const children = [fiber.type(fiber.props)];
    fiber.props.children = children;
    reconcileChildren(fiber);
  } else {
    if (!fiber.dom) {
      fiber.dom = createDom(fiber);
    }
    reconcileChildren(fiber);
  }

  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber);
  return dfs(fiber);
};

const reconcileChildren = (fiber: Fiber) => {
  if (!fiber) {
    console.error("fiber is null");
  }
  let oldFiber = fiber.alternate?.child;
  const newChildrenElements = fiber.props?.children;
  let index = 0;
  let prevChild: Fiber | null = null;
  while (oldFiber || (newChildrenElements && index <= newChildrenElements.length - 1)) {
    const newChildElement = newChildrenElements?.[index];
    const sameType = oldFiber?.type === newChildElement?.type;
    let newFIber: Fiber | null = null;
    if (sameType) {
      // update
      newFIber = {
        type: newChildElement.type,
        props: newChildElement.props,
        dom: oldFiber?.dom,
        child: null,
        parent: fiber,
        alternate: oldFiber,
        effectTag: TagEnum.UPDATE,
      };
    }
    if (!sameType && newChildElement) {
      // add
      newFIber = {
        type: newChildElement.type,
        props: newChildElement.props,
        dom: null,
        child: null,
        parent: fiber,
        alternate: null,
        effectTag: TagEnum.PLACEMENT,
      };
    }
    if (!sameType && oldFiber) {
      // delete
      oldFiber.effectTag = TagEnum.DELETION;
      deletions.push(oldFiber);
    }
    if (prevChild) {
      prevChild.sibling = newFIber;
      prevChild = newFIber;
    } else {
      fiber.child = newFIber;
      prevChild = newFIber;
    }
    index++;
    oldFiber = oldFiber?.sibling;
  }
};

const workLoop = (deadline: IdleDeadline) => {
  // 当有要渲染的工作单元 且 时间片够时 渲染
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 当时间片不够时 则暂停
    if (deadline.timeRemaining() < 1) {
      shouldYield = true;
    }
  }
  // 当没有要渲染的工作单元 且 时间片够时 进入提交阶段
  if (!nextUnitOfWork && !shouldYield) {
    console.log("render done");
    commitRoot();
  }
  if (shouldYield) {
    requestIdleCallback(workLoop);
  }
};

/**
 *
 * @param element 需要渲染的React元素
 * @param container 渲染容器 dom
 */
export const render = (element: Element, container: HTMLElement) => {
  wipRoot = null;
  nextUnitOfWork = null;
  shouldYield = false;

  if (!element) {
    console.error("element is null");
  }
  if (!container) {
    console.error("container is null");
  }

  wipRoot = {
    dom: container, // root 对应container ， 在这里确立挂载关系
    props: {
      children: [element],
    },
    type: "root",
    child: null,
    parent: null,
    sibling: null,
    alternate: currentRoot,
  };
  nextUnitOfWork = wipRoot;
  requestIdleCallback(workLoop);
  return wipRoot;
};

/** @jsx Didact.createElement */
function Counter() {
  const [state, setState] = useState(1);
  return <h1 onClick={() => setState((c) => c + 1)}>Count: {state}</h1>;
}
const element = <Counter />;
const container = document.getElementById("root");
render(element, container);
