import { Logo } from '@components/shared/Logo';
import { render, screen } from '@utils/test/render';

describe('Logo', () => {
  it('links home and shows the Ouwl image', () => {
    render(<Logo />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/');
    expect(screen.getByAltText('Ouwl.house — home')).toBeInTheDocument();
  });
});
