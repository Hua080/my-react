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
