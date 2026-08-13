import { VideoContainer } from '@components/experience';
import { render, screen } from '@utils/test/render';

describe('VideoContainer', () => {
  const video = {
    videoTitle: 'Team Quirk Live Tracker',
    videoUrl: 'https://www.youtube.com/embed/34Tb79-2ekc?rel=0',
  };

  // Asserted against the iframe rather than an empty container: the custom
  // render wraps children in MantineProvider, which injects a <style> element.
  it('renders no embed without a video url', () => {
    const { container } = render(<VideoContainer />);

    expect(container.querySelector('iframe')).toBeNull();
  });

  it('renders no embed when a video is supplied without a url', () => {
    const { container } = render(
      <VideoContainer video={{ videoTitle: 'No url' } as typeof video} />
    );

    expect(container.querySelector('iframe')).toBeNull();
  });

  it('renders the embed with an accessible title', () => {
    render(<VideoContainer video={video} />);

    expect(screen.getByTitle(video.videoTitle)).toHaveAttribute(
      'src',
      video.videoUrl
    );
  });

  // Guards a real performance regression rather than an implementation
  // detail. This embed sits ~35,000px down the page and a bare
  // `youtube.com/embed` frame costs roughly a megabyte of player JavaScript,
  // so loading it eagerly measurably hurt /experience in PageSpeed. Dropping
  // the attribute would silently reintroduce that.
  it('defers loading the third-party player', () => {
    render(<VideoContainer video={video} />);

    expect(screen.getByTitle(video.videoTitle)).toHaveAttribute(
      'loading',
      'lazy'
    );
  });

  // The reserved box is what makes deferring safe: without intrinsic
  // dimensions a lazily-loaded iframe would shift layout when it arrives.
  it('reserves space so deferring cannot cause layout shift', () => {
    render(<VideoContainer video={video} />);

    const frame = screen.getByTitle(video.videoTitle);

    expect(frame).toHaveAttribute('width', '1280');
    expect(frame).toHaveAttribute('height', '720');
  });
});
