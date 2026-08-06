import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { Navigation } from '@components/nav/Navigation';
import { PortfolioStateProvider } from '@state/context';
import { render, screen } from '@utils/test/render';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

describe('Navigation', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ pathname: '/' });
  });

  it('renders the logo and every menu item', () => {
    render(
      <PortfolioStateProvider>
        <Navigation />
      </PortfolioStateProvider>
    );

    expect(screen.getByRole('link', { name: 'Ouwl' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Travel' })).toBeInTheDocument();
  });

  it('also renders every menu item inside the mobile drawer once opened', async () => {
    render(
      <PortfolioStateProvider>
        <Navigation />
      </PortfolioStateProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    // { hidden: true } is needed here: once the modal drawer is open, Mantine
    // correctly marks the rest of the page (including the desktop nav's own
    // "Travel" link) aria-hidden, so only the drawer's copy is normally
    // accessible — this assertion is about DOM presence, not a11y-tree state.
    expect(
      screen.getAllByRole('link', { hidden: true, name: 'Travel' })
    ).toHaveLength(2);
  });

  it('opens the mobile menu as an accessible dialog via the burger button', async () => {
    render(
      <PortfolioStateProvider>
        <Navigation />
      </PortfolioStateProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // the toggle button itself is background content while the drawer is
    // open, so it's correctly excluded from the default a11y-tree query —
    // confirming that also confirms its aria-label flipped to "Close menu"
    expect(
      screen.queryByRole('button', { name: 'Close menu' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { hidden: true, name: 'Close menu' })
    ).toBeInTheDocument();
  });
});
