import { cancelableDelay, delay } from '@utils/common/delay';

const fetchTimeout = 8000;
const retryDelay = 250;
const retryableStatuses = new Set([429]);

class FetchError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

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

const request = async <T>(url: string): Promise<T> => {
  const {
    controller: { signal },
    timerId,
  } = abortController();

  try {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      const message = await response.text();

      throw new FetchError(
        message || `Request failed with status ${response.status}`,
        response.status
      );
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timerId);
  }
};

const asError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

const isRetryable = (error: unknown): boolean =>
  !(error instanceof FetchError) ||
  error.status >= 500 ||
  retryableStatuses.has(error.status);

const fetchWithRetry = async <T>(
  url: string,
  retries: number,
  attempt: number
): Promise<T> => {
  try {
    return await request<T>(url);
  } catch (error) {
    if (retries <= 0 || !isRetryable(error)) {
      throw asError(error);
    }

    await delay(retryDelay * 2 ** attempt);

    return fetchWithRetry<T>(url, retries - 1, attempt + 1);
  }
};

export const fetcher = <T>(url: string, retries: number = 2): Promise<T> =>
  fetchWithRetry<T>(url, retries, 0);
