import { waitFor } from "@testing-library/react";
import { render } from "../render";

// Mock createDom function
// 先定义一个函数来创建 DOM 元素
const mockCreateDomElement = () => document.createElement("div");
jest.mock("../createDom", () => ({
  createDom: jest.fn(mockCreateDomElement),
}));

describe("构建Fiber树", () => {
  let container;
  let consoleSpy;
  beforeEach(() => {
    // 创建一个 DOM 容器作为测试的根节点
    container = document.createElement("div");
    document.body.appendChild(container);
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    requestIdleCallback = jest.fn((callback) => {
      const start = Date.now();
      setTimeout(() => {
        callback({
          timeRemaining: () => Math.max(0, 16 - (Date.now() - start)), // 模拟 50ms 的空闲时间
          didTimeout: false,
        });
      }, 0); // 模拟异步调用
    });
  });

  afterEach(() => {
    // 清理 DOM
    document.body.removeChild(container);
    container = null;

    //
    consoleSpy.mockRestore();
  });

  it("should render a simple element", async () => {
    const element = {
      type: "div",
      props: {
        children: [],
      },
    };

    const wipRoot = render(element, container);

    // 使用 waitFor 等待 console.log 被调用并输出包含 "commit" 的字符串
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("进入commit 阶段"));
    });

    // 验证 createDom 被调用
    // expect(createDom).toHaveBeenCalled();

    // 验证 Fiber 树的根节点wipRoot的结构：包含一个child div
    expect(wipRoot?.child).not.toBeNull();
    expect(wipRoot?.child?.type).toBe("div");
  });

  it("should create fibers for children", async () => {
    const element = {
      type: "div",
      props: {
        children: [
          { type: "p", props: { children: [] } },
          { type: "span", props: { children: [] } },
        ],
      },
    };

    const wipRoot = render(element, container);
    // 使用 waitFor 等待 console.log 被调用并输出包含 "commit" 的字符串
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("进入commit 阶段"));
    });

    // 验证 createDom 被调用多次
    // expect(createDom).toHaveBeenCalledTimes(3); // 根节点 + 两个子节点

    // 验证 Fiber 树结构
    const firstChild = wipRoot?.child?.child;
    expect(firstChild?.type).toBe("p");
    expect(firstChild?.sibling?.type).toBe("span");
  });

  it("should handle null or undefined element gracefully", async () => {
    console.log = jest.fn();

    render(null, container);
    expect(console.log).toHaveBeenCalledWith("element is null");

    render(undefined, container);
    expect(console.log).toHaveBeenCalledWith("element is null");
  });

  it("should handle null or undefined container gracefully", async () => {
    console.log = jest.fn();

    const element = {
      type: "div",
      props: {
        children: [],
      },
    };

    render(element, null);
    expect(console.log).toHaveBeenCalledWith("container is null");

    render(element, undefined);
    expect(console.log).toHaveBeenCalledWith("container is null");
  });
});

describe("workLoop", () => {});
