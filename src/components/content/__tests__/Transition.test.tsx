import { Transition } from '@components/content/Transition';
import { render, screen } from '@utils/test/render';

describe('Transition', () => {
  it('renders a loading indicator', () => {
    render(<Transition />);

    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });
});
