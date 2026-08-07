import { usePortfolioState } from '@state/context';
import { renderHook } from '@utils/test/render';

describe('usePortfolioState', () => {
  it('throws when used outside a PortfolioStateProvider', () => {
    expect(() => renderHook(() => usePortfolioState())).toThrow(
      'usePortfolioState must be used within a PortfolioStateProvider'
    );
  });
});
