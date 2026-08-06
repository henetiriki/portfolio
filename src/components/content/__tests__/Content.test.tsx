import { Content } from '@components/content/Content';
import { render, screen } from '@utils/test/render';

describe('Content', () => {
  it('renders its children', () => {
    render(<Content>Hello there</Content>);

    expect(screen.getByText('Hello there')).toBeInTheDocument();
  });

  it('renders both wave dividers by default', () => {
    const { container } = render(<Content>Hello there</Content>);

    expect(container.querySelectorAll('img')).toHaveLength(2);
  });

  it('omits the top wave when waveTop is false', () => {
    const { container } = render(
      <Content waveTop={false}>Hello there</Content>
    );

    expect(container.querySelectorAll('img')).toHaveLength(1);
  });

  it('omits the bottom wave when waveBottom is false', () => {
    const { container } = render(
      <Content waveBottom={false}>Hello there</Content>
    );

    expect(container.querySelectorAll('img')).toHaveLength(1);
  });

  it('omits both waves when both are false', () => {
    const { container } = render(
      <Content waveBottom={false} waveTop={false}>
        Hello there
      </Content>
    );

    expect(container.querySelectorAll('img')).toHaveLength(0);
  });
});
