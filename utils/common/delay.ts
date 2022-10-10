export const delay = (duration: number): Promise<() => void> =>
  new Promise(resolve => setTimeout(resolve, duration));

export const cancelableDelay = (
  duration: number,
  callback: () => void
): ReturnType<typeof setTimeout> => setTimeout(callback, duration);
