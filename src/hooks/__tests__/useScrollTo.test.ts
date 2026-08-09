import { useReducedMotion } from '@mantine/hooks';
import { useScrollTo } from '@hooks';
import { renderHook } from '@utils/test/render';
import type { RefObject } from 'react';

jest.mock('@mantine/hooks', () => ({
  ...jest.requireActual('@mantine/hooks'),
  useReducedMotion: jest.fn(),
}));

describe('useScrollTo', () => {
  beforeEach(() => {
    (useReducedMotion as jest.Mock).mockReturnValue(false);
  });

  it('does nothing when the ref is undefined', () => {
    const { result } = renderHook(() => useScrollTo(undefined));

    expect(() => result.current.scrollToTop()).not.toThrow();
  });

  it('does nothing when the ref has no current element', () => {
    const ref = { current: null } as RefObject<HTMLDivElement | null>;
    const { result } = renderHook(() => useScrollTo(ref));

    expect(() => result.current.scrollToTop()).not.toThrow();
  });

  it('smooth-scrolls the ref element into view', () => {
    const scrollIntoView = jest.fn();
    const ref = {
      current: { scrollIntoView } as unknown as HTMLDivElement,
    } as RefObject<HTMLDivElement | null>;
    const { result } = renderHook(() => useScrollTo(ref));

    result.current.scrollToTop();

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('scrolls immediately when reduced motion is preferred', () => {
    (useReducedMotion as jest.Mock).mockReturnValue(true);
    const scrollIntoView = jest.fn();
    const ref = {
      current: { scrollIntoView } as unknown as HTMLDivElement,
    } as RefObject<HTMLDivElement | null>;
    const { result } = renderHook(() => useScrollTo(ref));

    result.current.scrollToTop();

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
    });
  });
});
