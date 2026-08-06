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

  it('rejects with the text() promise (not its resolved value) once retries are exhausted', async () => {
    const text = jest.fn().mockResolvedValue('Internal Server Error');

    global.fetch = jest.fn().mockResolvedValue({ ok: false, text });

    let rejection: unknown;

    try {
      await fetcher('/api/test', 0);
    } catch (error: unknown) {
      rejection = error;
    }

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(rejection).toBeInstanceOf(Promise);
    await expect(rejection).resolves.toBe('Internal Server Error');
  });
});
