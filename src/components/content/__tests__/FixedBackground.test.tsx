import { useRouter } from 'next/router';
import { FixedBackground } from '@components/content/FixedBackground';
import { PortfolioStateProvider, usePortfolioState } from '@state/context';
import { render, screen, waitFor } from '@utils/test/render';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const PageTopRefProbe = () => {
  const {
    state: {
      shared: { pageTopRef },
    },
  } = usePortfolioState();

  return <div>pageTopRef: {pageTopRef ? 'set' : 'unset'}</div>;
};

describe('FixedBackground', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      asPath: '/',
      events: { off: jest.fn(), on: jest.fn() },
      isReady: true,
    });
  });

  it('registers a pageTopRef in global state on mount', async () => {
    render(
      <PortfolioStateProvider>
        <FixedBackground />
        <PageTopRefProbe />
      </PortfolioStateProvider>
    );

    expect(await screen.findByText('pageTopRef: set')).toBeInTheDocument();
  });

  it('renders the fetched image once useIgImgId resolves', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ imgId: 'abc123' }),
      ok: true,
    });

    const { container } = render(
      <PortfolioStateProvider>
        <FixedBackground />
      </PortfolioStateProvider>
    );

    expect(container.querySelector('img')).not.toBeInTheDocument();

    await waitFor(() => {
      const img = container.querySelector('img');

      expect(img?.getAttribute('src')).toContain(
        encodeURIComponent('http://localhost:3000/images/abc123.jpg')
      );
    });
  });

  it('falls back to the default image id when the fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, text: jest.fn() });

    const { container } = render(
      <PortfolioStateProvider>
        <FixedBackground />
      </PortfolioStateProvider>
    );

    await waitFor(() => {
      const img = container.querySelector('img');

      expect(img?.getAttribute('src')).toContain(
        encodeURIComponent('http://localhost:3000/images/B8S5LnGpGUn.jpg')
      );
    });
  });
});
