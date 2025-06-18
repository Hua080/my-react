import { updateDom } from "updateDom";
import { Fiber } from "./types";
export const createDom = (fiber: Fiber) => {
  if (!fiber) {
    console.error("fiber is null");
  }
  const dom = fiber.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
};
