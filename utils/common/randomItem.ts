export const randomItem = <T>(items: T[]): T => {
  const [item] = items.splice(Math.floor(Math.random() * items.length), 1);

  return item;
};
