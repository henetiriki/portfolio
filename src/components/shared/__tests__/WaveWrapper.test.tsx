import { WaveWrapper } from '@components/shared/WaveWrapper';
import { render } from '@utils/test/render';

describe('WaveWrapper', () => {
  it('renders the image matching the given wave', () => {
    const { container } = render(<WaveWrapper wave='content-top' />);
    const img = container.querySelector('img');

    expect(img?.getAttribute('src')).toContain('content-top');
  });

  it('renders a different image for a different wave', () => {
    const { container } = render(<WaveWrapper wave='footer-bottom' />);
    const img = container.querySelector('img');

    expect(img?.getAttribute('src')).toContain('footer-bottom');
  });
});
