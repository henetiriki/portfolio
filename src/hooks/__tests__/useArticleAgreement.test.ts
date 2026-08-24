import { useArticleAgreement } from '@hooks';
import { renderHook, waitFor } from '@utils/test/render';

describe('useArticleAgreement', () => {
  it('starts as "a"', () => {
    const { result } = renderHook(() => useArticleAgreement());

    expect(result.current[0]).toBe('a');
  });

  it('does nothing when the ref is detached', () => {
    const { result } = renderHook(() => useArticleAgreement());

    expect(result.current[1](null)).toBeUndefined();
  });

  it('switches to "an" when the observed text starts with a vowel sound', async () => {
    const { result } = renderHook(() => useArticleAgreement());
    const node = document.createElement('span');

    result.current[1](node);
    node.textContent = 'amateur photographer';

    await waitFor(() => expect(result.current[0]).toBe('an'));
  });

  it('switches back to "a" when the observed text starts with a consonant sound', async () => {
    const { result } = renderHook(() => useArticleAgreement());
    const node = document.createElement('span');

    result.current[1](node);
    node.textContent = 'amateur photographer';
    await waitFor(() => expect(result.current[0]).toBe('an'));

    node.textContent = 'plane spotter';
    await waitFor(() => expect(result.current[0]).toBe('a'));
  });

  it('ignores a mutation that leaves the node empty', async () => {
    const { result } = renderHook(() => useArticleAgreement());
    const node = document.createElement('span');

    result.current[1](node);
    node.textContent = 'amateur photographer';
    await waitFor(() => expect(result.current[0]).toBe('an'));

    node.textContent = '';
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current[0]).toBe('an');
  });

  it('disconnects its observer on cleanup', () => {
    const disconnectSpy = jest.spyOn(MutationObserver.prototype, 'disconnect');
    const { result } = renderHook(() => useArticleAgreement());
    const node = document.createElement('span');

    const cleanup = result.current[1](node);

    cleanup?.();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});
