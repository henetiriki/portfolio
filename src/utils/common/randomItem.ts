export const randomItem = <T>(items: readonly T[]): T | undefined => {
  if (!items.length) {
    return undefined;
  }

  return items[Math.floor(Math.random() * items.length)];
};
