/**
 *  深度优先遍历
 * @param  node 当前节点
 *
 */
export const dfs = (node) => {
  if (node.child) {
    return node.child;
  }
  if (node.sibling) {
    return node.sibling;
  }
  let current = node.parent;
  while (current) {
    if (current.sibling) {
      return current.sibling;
    }
    current = current.parent;
  }
  return null;
};
