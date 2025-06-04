import { createElement } from "../createElement";

// 创建简单的元素
describe("createElement", () => {
  test("创建简单的元素", () => {
    const element = createElement("div", { id: "test" });
    expect(element.type).toEqual("div");
    expect(element.props.id).toEqual("test");
  });
  test("创建子元素", () => {
    const element = createElement("div", { id: "parent" }, createElement("span", { id: "child1" }), createElement("p", { id: "child2" }));
    expect(element.type).toEqual("div");
    expect(element.props.children).toEqual([
      {
        type: "span",
        props: {
          id: "child1",
          children: [],
        },
      },
      {
        type: "p",
        props: {
          id: "child2",
          children: [],
        },
      },
    ]);
  });
  test("创建文本元素", () => {
    const element = createElement("div", null, "hello");
    const child = element.props.children[0];
    expect(child.type).toEqual("TEXT_ELEMENT");
    expect(child.props.nodeValue).toEqual("hello");
  });
});
