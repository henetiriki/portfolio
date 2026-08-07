import { fetcher } from '@utils/common/fetcher';

describe('fetcher', () => {
  it('resolves with the parsed JSON body on a successful response', async () => {
    const json = jest.fn().mockResolvedValue({ hello: 'world' });

    global.fetch = jest.fn().mockResolvedValue({ json, ok: true });

    await expect(fetcher('/api/test')).resolves.toEqual({ hello: 'world' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('retries on a non-ok response before succeeding', async () => {
    const json = jest.fn().mockResolvedValue({ hello: 'world' });

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ json, ok: true });

    await expect(fetcher('/api/test')).resolves.toEqual({ hello: 'world' });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('rejects with the resolved response text once retries are exhausted', async () => {
    const text = jest.fn().mockResolvedValue('Internal Server Error');

    global.fetch = jest.fn().mockResolvedValue({ ok: false, text });

    await expect(fetcher('/api/test', 0)).rejects.toBe('Internal Server Error');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('aborts the in-flight request once the 30s timeout elapses', async () => {
    jest.useFakeTimers();

    let capturedSignal: AbortSignal | undefined;

    global.fetch = jest.fn((_url, init?: RequestInit) => {
      capturedSignal = init?.signal as AbortSignal;

      return new Promise(() => {});
    });

    fetcher('/api/test');
    await Promise.resolve();

    expect(capturedSignal?.aborted).toBe(false);

    jest.advanceTimersByTime(30000);

    expect(capturedSignal?.aborted).toBe(true);

    jest.useRealTimers();
  });
});
