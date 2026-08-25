import mapClasses from '@components/travel/Map.module.css';
import { MapError } from '@components/travel/MapError';
import { render, screen } from '@utils/test/render';

describe('MapError', () => {
  it('renders the fallback heading and message', () => {
    render(<MapError />);

    expect(screen.getByText('Something’s gone wrong')).toBeInTheDocument();
    expect(
      screen.getByText('The map failed to load - please try again later.')
    ).toBeInTheDocument();
  });

  it('occupies the same height/background as the map it replaces', () => {
    const { container } = render(<MapError />);

    expect(
      container.querySelector(`.${mapClasses.mapContainer}`)
    ).toBeInTheDocument();
  });
});
