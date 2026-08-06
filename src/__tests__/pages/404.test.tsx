import { useRouter } from 'next/router';
import FourOhFour from '@pages/404';
import { PortfolioStateProvider, usePortfolioState } from '@state/context';
import { render, screen } from '@utils/test/render';
import type { FC } from 'react';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const ImgIdProbe: FC = () => {
  const {
    state: {
      shared: { imgId },
    },
  } = usePortfolioState();

  return <div>imgId: {imgId}</div>;
};

describe('404 page', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  });

  it('renders the not-found heading and message', () => {
    render(
      <PortfolioStateProvider>
        <FourOhFour />
      </PortfolioStateProvider>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /four-oh-four/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Looks like that doesn’t exist')
    ).toBeInTheDocument();
  });

  it('dispatches a fallback image id on mount', async () => {
    render(
      <PortfolioStateProvider>
        <FourOhFour />
        <ImgIdProbe />
      </PortfolioStateProvider>
    );

    expect(await screen.findByText('imgId: B8S5LnGpGUn')).toBeInTheDocument();
  });
});
