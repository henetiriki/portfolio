import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { Navigation } from '@components/nav/Navigation';
import { PortfolioStateProvider, usePortfolioState } from '@state/context';
import { fireEvent, render, screen, waitFor } from '@utils/test/render';
import type { FC, PropsWithChildren } from 'react';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const scrollTo = (y: number) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  fireEvent.scroll(window);
};

const WithPageTopRef: FC<PropsWithChildren> = ({ children }) => {
  const { dispatch } = usePortfolioState();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch({ payload: { pageTopRef: ref }, type: 'set-page-top-ref' });
  }, [dispatch]);

  return (
    <>
      <div ref={ref} />
      {children}
    </>
  );
};

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

  it('shows the scroll-to-top button once scrolled past the threshold', () => {
    render(
      <PortfolioStateProvider>
        <Navigation />
      </PortfolioStateProvider>
    );

    expect(
      screen.queryByRole('button', { name: 'Scroll to top' })
    ).not.toBeInTheDocument();

    scrollTo(50);

    expect(
      screen.getByRole('button', { name: 'Scroll to top' })
    ).toBeInTheDocument();
  });

  it('hides the scroll-to-top button again once scrolled back near the top', () => {
    render(
      <PortfolioStateProvider>
        <Navigation />
      </PortfolioStateProvider>
    );

    scrollTo(50);
    expect(
      screen.getByRole('button', { name: 'Scroll to top' })
    ).toBeInTheDocument();

    scrollTo(0);

    expect(
      screen.queryByRole('button', { name: 'Scroll to top' })
    ).not.toBeInTheDocument();
  });

  it('scrolls back to the page top when the scroll-to-top button is clicked', async () => {
    render(
      <PortfolioStateProvider>
        <WithPageTopRef>
          <Navigation />
        </WithPageTopRef>
      </PortfolioStateProvider>
    );

    scrollTo(50);

    await userEvent.click(
      screen.getByRole('button', { name: 'Scroll to top' })
    );

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('closes the drawer and scrolls to top when a drawer link is clicked', async () => {
    render(
      <PortfolioStateProvider>
        <WithPageTopRef>
          <Navigation />
        </WithPageTopRef>
      </PortfolioStateProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: 'Experience' }));

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
  });
});
