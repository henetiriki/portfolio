import { useRouter } from 'next/router';
import { Layout } from '@containers/layout/Layout';
import { PortfolioStateProvider } from '@state/context';
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

  it('renders the footer once the dynamic import resolves', async () => {
    render(
      <PortfolioStateProvider>
        <Layout>
          <div>page content</div>
        </Layout>
      </PortfolioStateProvider>
    );

    expect(await screen.findByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    );
  });
});
