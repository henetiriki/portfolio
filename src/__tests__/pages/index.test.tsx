import { useReducedMotion } from '@mantine/hooks';
import { openSourceContrs } from '@fixtures/home';
import Home from '@pages/index';
import { render, screen } from '@utils/test/render';

jest.mock('@mantine/hooks', () => ({
  ...jest.requireActual('@mantine/hooks'),
  useReducedMotion: jest.fn(),
}));

describe('Home page', () => {
  beforeEach(() => {
    (useReducedMotion as jest.Mock).mockReturnValue(false);
  });

  it('renders the name heading', async () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { level: 1, name: /louw swart/i })
    ).toBeInTheDocument();

    // the animated role tagline is a next/dynamic (ssr: false) component that
    // resolves asynchronously — wait for it so the test settles cleanly
    // instead of leaving a pending act() warning behind
    expect(await screen.findByText('ex-flight attendant turned programmer'));
  });

  it('renders the about-me content and open-source links', async () => {
    render(<Home />);

    expect(screen.getByText('About me')).toBeInTheDocument();
    openSourceContrs.forEach(({ text }) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    expect(await screen.findByText('ex-flight attendant turned programmer'));
  });

  it('heads the about section with the role rather than repeating the name', () => {
    render(<Home />);

    // see D-260816e — the name is the h1, so a second heading carrying it left
    // the outline naming the same person twice and the section not at all
    expect(
      screen.getAllByRole('heading', { name: /louw swart/i })
    ).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 3, name: 'Front-end Engineer' })
    ).toBeInTheDocument();
    expect(screen.getByText('Garden Route, South Africa')).toBeInTheDocument();
  });

  it('renders a static role tagline when reduced motion is preferred', () => {
    (useReducedMotion as jest.Mock).mockReturnValue(true);

    render(<Home />);

    expect(screen.getByText('front-end engineer')).toBeInTheDocument();
  });
});
