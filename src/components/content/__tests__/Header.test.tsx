import { Header } from '@components/content/Header';
import { render, screen } from '@utils/test/render';

describe('Header', () => {
  it('renders its children inside a heading', () => {
    render(
      <Header>
        Places I’ve been<span>you can steer yourself any direction</span>
      </Header>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /places i’ve been/i })
    ).toBeInTheDocument();
  });
});
