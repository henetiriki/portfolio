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

    portfolioItems.forEach(({ title }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });
});
