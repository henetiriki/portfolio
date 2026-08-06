import { getNodeText } from '@utils/common';

describe('getNodeText', () => {
  it('returns a plain string unchanged', () => {
    expect(getNodeText('hello')).toBe('hello');
  });

  it('joins an array of JSX elements', () => {
    expect(
      getNodeText([<span key='a'>hello</span>, <span key='b'>world</span>])
    ).toBe('helloworld');
  });

  it('extracts text from a single JSX element', () => {
    expect(getNodeText(<span>hello</span>)).toBe('hello');
  });

  it('extracts text from nested JSX elements', () => {
    expect(
      getNodeText(
        <span>
          <b>nested</b>
        </span>
      )
    ).toBe('nested');
  });

  it('extracts and joins text across JSX children with mixed types', () => {
    expect(
      getNodeText(
        <>
          {'a'}
          <b>b</b>
        </>
      )
    ).toBe('ab');
  });
});
