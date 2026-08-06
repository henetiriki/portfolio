import { useRouter } from 'next/router';
import FiveHundred from '@pages/500';
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

describe('500 page', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  });

  it('renders the server-error heading and message', () => {
    render(
      <PortfolioStateProvider>
        <FiveHundred />
      </PortfolioStateProvider>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /500/i })
    ).toBeInTheDocument();
    expect(screen.getByText('That wasn’t meant to happen')).toBeInTheDocument();
  });

  it('dispatches a fallback image id on mount', async () => {
    render(
      <PortfolioStateProvider>
        <FiveHundred />
        <ImgIdProbe />
      </PortfolioStateProvider>
    );

    expect(await screen.findByText('imgId: BBCcHOpxyJK')).toBeInTheDocument();
  });
});
