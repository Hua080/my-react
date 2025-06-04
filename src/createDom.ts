import { FindByRole } from "@testing-library/react";
import { Fiber } from "./types";
export const createDom = (fiber: Fiber) => {
  if (!fiber) {
    console.error("fiber is null");
  }
  const {
    type,
    props: { children, ...props },
  } = fiber;

  const dom = type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(type);
  Object.keys(props).forEach((prop) => {
    dom[prop] = props[prop];
  });
  return dom;
};
