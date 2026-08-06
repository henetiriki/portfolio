import Travel from '@pages/travel';
import { render, screen } from '@utils/test/render';

jest.mock('../../components/travel', () => ({
  ...jest.requireActual('../../components/travel'),
  MapWrapper: () => <div>MapWrapper</div>,
}));

describe('Travel page', () => {
  it('renders the page heading', async () => {
    render(<Travel />);

    expect(
      screen.getByRole('heading', { level: 1, name: /places i.ve been/i })
    ).toBeInTheDocument();

    expect(await screen.findByText('MapWrapper')).toBeInTheDocument();
  });

  it('renders the travel history heading, the map, and the legend', async () => {
    render(<Travel />);

    expect(screen.getByText('Travel history')).toBeInTheDocument();
    expect(await screen.findByText('MapWrapper')).toBeInTheDocument();
    expect(screen.getByText('Legend')).toBeInTheDocument();
  });
});
