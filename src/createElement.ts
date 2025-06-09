import { Element } from "./types";

export const createElement = (type: string, props: Record<string, any> | null, ...children: (Element | string)[]): Element => {
  return {
    type: type,
    props: {
      ...props,
      children:
        children?.map((child) => {
          if (typeof child === "string") {
            return createElement("TEXT_ELEMENT", { nodeValue: child });
          }
          return child;
        }) || [],
    },
  };
};

// 导出 JSX 运行时所需的函数
export const jsx = createElement;
export const jsxs = createElement;
export const jsxDEV = createElement;
