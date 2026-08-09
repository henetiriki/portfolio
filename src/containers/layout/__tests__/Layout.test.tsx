import { MantineProvider } from '@mantine/core';
import { useRouter } from 'next/router';
import { renderToString } from 'react-dom/server';
import { Layout } from '@containers/layout/Layout';
import { PortfolioStateProvider } from '@state/context';
import { theme } from '@styles';
import { render, screen } from '@utils/test/render';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

describe('Layout', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ pathname: '/' });
  });

  it('renders its children', () => {
    render(
      <PortfolioStateProvider>
        <Layout>
          <div>page content</div>
        </Layout>
      </PortfolioStateProvider>
    );

    expect(screen.getByText('page content')).toBeInTheDocument();
  });

  it('renders the footer with the rest of the layout', () => {
    render(
      <PortfolioStateProvider>
        <Layout>
          <div>page content</div>
        </Layout>
      </PortfolioStateProvider>
    );

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('renders the footer during server rendering', () => {
    const html = renderToString(
      <MantineProvider forceColorScheme='dark' theme={theme}>
        <PortfolioStateProvider>
          <Layout>
            <div>page content</div>
          </Layout>
        </PortfolioStateProvider>
      </MantineProvider>
    );

    expect(html).toContain('<footer');
    expect(html).toContain('Updated:');
    expect(html).toContain('test');
  });
});
