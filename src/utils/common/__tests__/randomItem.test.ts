import { randomItem } from '@utils/common';

describe('randomItem', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolves the only item in a single-element array', async () => {
    await expect(randomItem(['only'])).resolves.toBe('only');
  });

  it('picks the item at the Math.random()-derived index', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    await expect(randomItem(['a', 'b', 'c', 'd'])).resolves.toBe('c');
  });

  it('removes the returned item from the source array', async () => {
    const items = ['a', 'b', 'c'];

    jest.spyOn(Math, 'random').mockReturnValue(0);
    const picked = await randomItem(items);

    expect(picked).toBe('a');
    expect(items).toEqual(['b', 'c']);
  });
});
