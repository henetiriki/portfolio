import { openSourceContrs } from '@fixtures/home';
import Home from '@pages/index';
import { render, screen } from '@utils/test/render';

describe('Home page', () => {
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
});
