import { portfolioItems } from '@fixtures/portfolio';
import Portfolio from '@pages/portfolio';
import { render, screen } from '@utils/test/render';

describe('Portfolio page', () => {
  it('renders the page heading', () => {
    render(<Portfolio />);

    expect(
      screen.getByRole('heading', { level: 1, name: /portfolio/i })
    ).toBeInTheDocument();
  });

  it('renders a card for every portfolio item', () => {
    render(<Portfolio />);

    portfolioItems.forEach(({ img: { alt, src }, title }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByRole('img', { name: alt })).toHaveAttribute(
        'sizes',
        expect.stringContaining('(min-width: 67.5em)')
      );
      expect(screen.getByRole('img', { name: alt })).toHaveAttribute(
        'src',
        expect.stringContaining(encodeURIComponent(src))
      );
    });
  });
});
