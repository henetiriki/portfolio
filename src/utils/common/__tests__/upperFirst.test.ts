import { upperFirst } from '@utils/common';

describe('upperFirst', () => {
  it('capitalizes the first letter', () => {
    expect(upperFirst('hello')).toBe('Hello');
  });

  it('leaves an already-capitalized string unchanged', () => {
    expect(upperFirst('Hello')).toBe('Hello');
  });

  it('handles a single character', () => {
    expect(upperFirst('h')).toBe('H');
  });

  it('handles an empty string without throwing', () => {
    expect(upperFirst('')).toBe('');
  });
});
