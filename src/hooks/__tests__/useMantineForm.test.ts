import { useMantineForm } from '@hooks';
import { act, renderHook, waitFor } from '@utils/test/render';

describe('useMantineForm', () => {
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts with empty values and no errors', () => {
    const { result } = renderHook(() => useMantineForm());

    expect(result.current.form.values).toEqual({
      email: '',
      heuning: '',
      message: '',
      name: '',
    });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.apiErrors).toEqual([]);
  });

  it('marks the submission as successful and resets the form on a 200 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useMantineForm());

    act(() => {
      result.current.form.setFieldValue('name', 'Jane');
    });
    expect(result.current.form.values.name).toBe('Jane');

    await act(async () => {
      await result.current.submitForm(result.current.form.values);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/contact', {
      body: JSON.stringify({
        email: '',
        heuning: '',
        message: '',
        name: 'Jane',
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    expect(result.current.isSubmitted).toBe(true);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.form.values.name).toBe('');

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(result.current.isSubmitted).toBe(false);
  });

  it('surfaces the mapped error messages on a non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ data: ['e_name_required'] }),
      ok: false,
    });

    const { result } = renderHook(() => useMantineForm());

    await act(async () => {
      await result.current.submitForm(result.current.form.values);
    });

    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.apiErrors).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(result.current.apiErrors).toEqual([]);
  });

  it.each([null, 'invalid error payload'])(
    'falls back to a generic error for the malformed API payload %p',
    async data => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(data),
        ok: false,
      });

      const { result } = renderHook(() => useMantineForm());

      await act(async () => {
        await result.current.submitForm(result.current.form.values);
      });

      expect(result.current.apiErrors).toHaveLength(1);
      expect(result.current.isSubmitting).toBe(false);
    }
  );

  it('falls back to a generic error when the request itself fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useMantineForm());

    await act(async () => {
      await result.current.submitForm(result.current.form.values);
    });

    expect(result.current.apiErrors).toHaveLength(1);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('sets isSubmitting to true while the request is in flight', async () => {
    let resolveFetch: (value: { ok: boolean }) => void = () => {};

    global.fetch = jest.fn(
      () =>
        new Promise(resolve => {
          resolveFetch = resolve;
        })
    ) as jest.Mock;

    const { result } = renderHook(() => useMantineForm());

    act(() => {
      result.current.submitForm(result.current.form.values);
    });

    await waitFor(() => expect(result.current.isSubmitting).toBe(true));

    await act(async () => {
      resolveFetch({ ok: true });
    });

    expect(result.current.isSubmitting).toBe(false);
  });
});
