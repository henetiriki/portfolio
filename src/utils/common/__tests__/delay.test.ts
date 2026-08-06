import { cancelableDelay, delay } from '@utils/common';

describe('delay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves after the given duration', async () => {
    const promise = delay(100);

    jest.advanceTimersByTime(100);

    await expect(promise).resolves.toBeUndefined();
  });
});

describe('cancelableDelay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('invokes the callback after the given duration', () => {
    const callback = jest.fn();

    cancelableDelay(100, callback);
    jest.advanceTimersByTime(99);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('returns a timer id that can be used to cancel the callback', () => {
    const callback = jest.fn();

    const timerId = cancelableDelay(100, callback);

    clearTimeout(timerId);
    jest.advanceTimersByTime(100);

    expect(callback).not.toHaveBeenCalled();
  });
});
