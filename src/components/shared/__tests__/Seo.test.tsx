import { Children, isValidElement } from 'react';
import { Seo } from '@components/shared/Seo';
import { render } from '@utils/test/render';
import type { PropsWithChildren, ReactElement, ReactNode } from 'react';

type HeadElementProps = PropsWithChildren<{
  content?: string;
  href?: string;
  name?: string;
  property?: string;
  rel?: string;
}>;

const mockHead = jest.fn<null, [{ children: ReactNode }]>(() => null);

jest.mock('next/head', () => ({
  __esModule: true,
  default: (props: { children: ReactNode }) => mockHead(props),
}));

const headElements = (): ReactElement<HeadElementProps>[] =>
  Children.toArray(mockHead.mock.calls[0][0].children).filter(
    (child): child is ReactElement<HeadElementProps> =>
      isValidElement<HeadElementProps>(child)
  );

const findMeta = (
  attribute: 'name' | 'property',
  value: string
): ReactElement<HeadElementProps> | undefined =>
  headElements().find(element =>
    attribute === 'name'
      ? element.props.name === value
      : element.props.property === value
  );

describe('Seo', () => {
  it('renders consistent page, Open Graph and Twitter metadata', () => {
    render(<Seo description='Get in touch' path='/contact' title='Contact' />);

    const elements = headElements();
    const title = elements.find(element => element.type === 'title');
    const canonical = elements.find(
      element => element.props.rel === 'canonical'
    );

    expect(title?.props.children).toBe('Contact // Louw Swart');
    expect(canonical?.props.href).toBe('http://localhost:3000/contact');
    expect(findMeta('name', 'description')?.props.content).toBe('Get in touch');
    expect(findMeta('name', 'twitter:title')?.props.content).toBe(
      'Contact // Louw Swart'
    );
    expect(findMeta('name', 'twitter:url')?.props.content).toBe(
      'http://localhost:3000/contact'
    );
    expect(findMeta('name', 'twitter:description')?.props.content).toBe(
      'Get in touch'
    );
    expect(findMeta('name', 'twitter:image')?.props.content).toBe(
      'http://localhost:3000/images/og-images/portfolio.png'
    );
    expect(findMeta('property', 'og:title')?.props.content).toBe(
      'Contact // Louw Swart'
    );
    expect(findMeta('property', 'og:url')?.props.content).toBe(
      'http://localhost:3000/contact'
    );
    expect(findMeta('property', 'og:description')?.props.content).toBe(
      'Get in touch'
    );
    expect(findMeta('property', 'og:image')?.props.content).toBe(
      'http://localhost:3000/images/og-images/portfolio.png'
    );
    expect(findMeta('name', 'keywords')).toBeUndefined();
  });
});
