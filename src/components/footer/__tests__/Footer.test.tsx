import { useRouter } from 'next/router';
import { Footer } from '@components/footer/Footer';
import { PortfolioStateProvider } from '@state/context';
import { render, screen } from '@utils/test/render';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

describe('Footer', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ pathname: '/' });
  });

  it('renders the primary nav links', () => {
    render(
      <PortfolioStateProvider>
        <Footer />
      </PortfolioStateProvider>
    );

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    );
    expect(screen.getByRole('link', { name: 'Experience' })).toHaveAttribute(
      'href',
      '/experience'
    );
  });

  it('renders the social links', () => {
    render(
      <PortfolioStateProvider>
        <Footer />
      </PortfolioStateProvider>
    );

    expect(screen.getByTitle('See examples of my code here')).toHaveAttribute(
      'href',
      'https://github.com/henetiriki'
    );
  });

  it('shows the last-modified timestamp from runtime config', () => {
    render(
      <PortfolioStateProvider>
        <Footer />
      </PortfolioStateProvider>
    );

    expect(screen.getByText(/Updated: test/)).toBeInTheDocument();
  });

  it('shows the current copyright year', () => {
    render(
      <PortfolioStateProvider>
        <Footer />
      </PortfolioStateProvider>
    );

    const year = new Date().getFullYear().toString();

    expect(screen.getByText(`2014 - ${year}`)).toBeInTheDocument();
  });
});
