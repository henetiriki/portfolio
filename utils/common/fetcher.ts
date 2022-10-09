const fetchTimeout = 30000;

const abortController = (): {
  controller: AbortController;
  timerId: ReturnType<typeof setTimeout>;
} => {
  const controller = new AbortController();
  const timerId: ReturnType<typeof setTimeout> = setTimeout(
    () => controller.abort(),
    fetchTimeout
  );

  return { controller, timerId };
};

export const fetcher = async <T>(url: string): Promise<T> => {
  const {
    controller: { signal },
    timerId,
  } = abortController();
  const response = await fetch(url, { signal });

  clearTimeout(timerId);

  if (response.ok) {
    return response.json();
  }

  return Promise.reject(response.text());
};
