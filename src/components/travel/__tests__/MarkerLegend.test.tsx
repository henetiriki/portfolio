import { MarkerLegend } from '@components/travel/MarkerLegend';
import { markerIconPath } from '@fixtures/travel/icons';
import { render, screen } from '@utils/test/render';

describe('MarkerLegend', () => {
  it('uses the same path, color and scale as the map marker', () => {
    const { container } = render(
      <MarkerLegend icon={{ color: '#123456', scale: 1.25 }}>
        current location
      </MarkerLegend>
    );
    const svg = container.querySelector('svg');
    const path = container.querySelector('path');

    expect(screen.getByText('current location')).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveStyle({ transform: 'scale(1.25)' });
    expect(path).toHaveAttribute('d', markerIconPath);
    expect(path).toHaveAttribute('fill', '#123456');
    expect(path).toHaveAttribute('fill-opacity', '0.95');
  });
});
