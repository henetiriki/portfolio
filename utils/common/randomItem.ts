export const randomItem = async <T>(items: T[]): Promise<T> => {
  const [item] = items.splice(Math.floor(Math.random() * items.length), 1);

  return item;
};
