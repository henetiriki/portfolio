import { cancelableDelay } from '@utils/common/delay';

const fetchTimeout = 30000;

const abortController = (): {
  controller: AbortController;
  timerId: ReturnType<typeof setTimeout>;
} => {
  const controller = new AbortController();
  const timerId: ReturnType<typeof setTimeout> = cancelableDelay(
    fetchTimeout,
    () => controller.abort()
  );

  return { controller, timerId };
};

export const fetcher = async <T>(
  url: string,
  retries: number = 2
): Promise<T> => {
  const {
    controller: { signal },
    timerId,
  } = abortController();
  const response = await fetch(url, { signal });

  clearTimeout(timerId);

  if (!response.ok) {
    if (retries > 0) {
      return fetcher(url, retries - 1);
    }

    return Promise.reject(response.text());
  }

  return response.json();
};
