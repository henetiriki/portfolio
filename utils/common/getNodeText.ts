import type { JSX } from 'react';

export const getNodeText = (
  node: JSX.Element | JSX.Element[] | string
): string => {
  if (node instanceof Array) {
    return node.map(getNodeText).join('');
  }

  if (typeof node === 'object' && node) {
    return getNodeText(node.props.children);
  }

  return String(node);
};
