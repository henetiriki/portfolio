import { selectChecks } from '../validate.mjs';

type Check = { args: string[]; name: string; sourceOnly?: boolean };

const CHECKS: Check[] = [
  { args: ['prettier:check'], name: 'Formatting' },
  { args: ['test:coverage'], name: 'Unit tests' },
  { args: ['eslint:check'], name: 'Lint', sourceOnly: true },
  { args: ['build'], name: 'Production build', sourceOnly: true },
];

const names = (checks: Check[]) => checks.map(check => check.name);

describe('selectChecks', () => {
  it('runs everything when the change is not documentation-only', () => {
    const { running, skipped } = selectChecks(false, CHECKS);

    expect(names(running)).toEqual([
      'Formatting',
      'Unit tests',
      'Lint',
      'Production build',
    ]);
    expect(skipped).toHaveLength(0);
  });

  it('sets aside only the source-only checks on a documentation-only change', () => {
    const { running, skipped } = selectChecks(true, CHECKS);

    expect(names(running)).toEqual(['Formatting', 'Unit tests']);
    expect(names(skipped)).toEqual(['Lint', 'Production build']);
  });

  it('accounts for every check either way, so none is silently dropped', () => {
    for (const documentationOnly of [true, false]) {
      const { running, skipped } = selectChecks(documentationOnly, CHECKS);

      expect(running.length + skipped.length).toBe(CHECKS.length);
    }
  });

  it('keeps the real check list ordered cheapest first', () => {
    const { running } = selectChecks(false);

    expect(running.at(0)?.name).toBe('Formatting');
    expect(running.at(-1)?.name).toBe('Browser suite');
  });
});
