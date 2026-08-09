import { randomItem } from '@utils/common';

describe('randomItem', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the only item in a single-element array', () => {
    expect(randomItem(['only'])).toBe('only');
  });

  it('picks the item at the Math.random()-derived index', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(randomItem(['a', 'b', 'c', 'd'])).toBe('c');
  });

  it('does not mutate the source array', () => {
    const items = ['a', 'b', 'c'];

    jest.spyOn(Math, 'random').mockReturnValue(0);
    const picked = randomItem(items);

    expect(picked).toBe('a');
    expect(items).toEqual(['a', 'b', 'c']);
  });

  it('returns undefined for an empty array', () => {
    expect(randomItem([])).toBeUndefined();
  });
});
