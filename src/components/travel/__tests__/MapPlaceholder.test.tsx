import { MapPlaceholder } from '@components/travel/MapPlaceholder';
import { render } from '@utils/test/render';

describe('MapPlaceholder', () => {
  it('renders the static map image as a decorative image', () => {
    const { container } = render(<MapPlaceholder rendered={false} />);

    const img = container.querySelector('img');

    expect(img).toHaveAttribute('alt', '');
    expect(img?.getAttribute('src')).toContain(
      encodeURIComponent('https://maps.googleapis.com/maps/api/staticmap')
    );
  });

  it('applies the hidden class once the live map has rendered', () => {
    const { container, rerender } = render(<MapPlaceholder rendered={false} />);

    const img = container.querySelector('img');

    expect(img?.className).not.toMatch(/placeholderHidden/);

    rerender(<MapPlaceholder rendered />);

    expect(img?.className).toMatch(/placeholderHidden/);
  });
});
