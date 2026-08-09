import { fetcher } from '@utils/common/fetcher';

describe('fetcher', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves with the parsed JSON body on a successful response', async () => {
    const json = jest.fn().mockResolvedValue({ hello: 'world' });

    global.fetch = jest.fn().mockResolvedValue({ json, ok: true });

    await expect(fetcher('/api/test')).resolves.toEqual({ hello: 'world' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('retries non-ok responses with exponential backoff', async () => {
    jest.useFakeTimers();

    const json = jest.fn().mockResolvedValue({ hello: 'world' });
    const text = jest.fn().mockResolvedValue('Service unavailable');

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503, text })
      .mockResolvedValueOnce({ ok: false, status: 503, text })
      .mockResolvedValueOnce({ json, ok: true });

    const response = fetcher('/api/test');

    await jest.advanceTimersByTimeAsync(249);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1);
    expect(global.fetch).toHaveBeenCalledTimes(2);

    await jest.advanceTimersByTimeAsync(499);
    expect(global.fetch).toHaveBeenCalledTimes(2);

    await jest.advanceTimersByTimeAsync(1);
    await expect(response).resolves.toEqual({ hello: 'world' });
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('retries a network failure before succeeding', async () => {
    jest.useFakeTimers();

    const json = jest.fn().mockResolvedValue({ hello: 'world' });

    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new TypeError('Network unavailable'))
      .mockResolvedValueOnce({ json, ok: true });

    const response = fetcher('/api/test');

    await jest.advanceTimersByTimeAsync(250);

    await expect(response).resolves.toEqual({ hello: 'world' });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('rejects with an Error once retries are exhausted', async () => {
    const text = jest.fn().mockResolvedValue('Internal Server Error');

    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 500, text });

    await expect(fetcher('/api/test', 0)).rejects.toEqual(
      new Error('Internal Server Error')
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('normalizes non-Error network rejections', async () => {
    global.fetch = jest.fn().mockRejectedValue('offline');

    await expect(fetcher('/api/test', 0)).rejects.toEqual(new Error('offline'));
  });

  it('clears the abort timer when a request rejects', async () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    global.fetch = jest
      .fn()
      .mockRejectedValue(new TypeError('Network unavailable'));

    await expect(fetcher('/api/test', 0)).rejects.toThrow(
      'Network unavailable'
    );
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
  });

  it('aborts and rejects an in-flight request after 30 seconds', async () => {
    jest.useFakeTimers();

    global.fetch = jest.fn((_url, init?: RequestInit) => {
      const signal = init?.signal;

      return new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted', 'AbortError'));
        });
      });
    });

    const response = fetcher('/api/test', 0);
    const rejection = expect(response).rejects.toMatchObject({
      name: 'AbortError',
    });

    await jest.advanceTimersByTimeAsync(30000);

    await rejection;
  });
});
