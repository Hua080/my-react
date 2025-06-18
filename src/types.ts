export interface Element {
  type: string;
  props: {
    children: (Element | TEXT_ELEMENT)[];
    [key: string]: any;
  };
}

export interface TEXT_ELEMENT {
  type: "TEXT_ELEMENT";
  props: {
    nodeValue: string;
  };
}

export interface Fiber {
  /** 元素类型 */
  type: string | Function;
  /** 元素属性 */
  props: { children?: any[]; [key: string]: any };
  /** 对应dom节点 */
  dom?: any | null;
  /** 第一个子元素 */
  child?: Fiber | null;
  /** 父元素 */
  parent: Fiber | null;
  /** 兄弟元素 */
  sibling?: Fiber | null;
  /** 对应生效中的fiber */
  alternate?: Fiber | null;
  /** 修改tag */
  effectTag?: TagEnum;
  /** hooks */
  hooks?: any[];
}
export enum TagEnum {
  UPDATE = "UPDATE",
  PLACEMENT = "PLACEMENT",
  DELETION = "DELETION",
}
