import { fullTitle } from '@utils/head';

describe('fullTitle', () => {
  it('appends the site suffix to a title', () => {
    expect(fullTitle('Contact')).toBe('Contact // Louw Swart');
  });

  it('trims surrounding whitespace from the title', () => {
    expect(fullTitle('  Travel  ')).toBe('Travel // Louw Swart');
  });
});
