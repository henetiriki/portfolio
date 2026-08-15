import { AppleSplashLinks } from '@components/shared/AppleSplashLinks';
import { render } from '@utils/test/render';

const MEDIA =
  /^\(device-width: (\d+)px\) and \(device-height: (\d+)px\) and \(-webkit-device-pixel-ratio: (\d+)\) and \(orientation: (portrait|landscape)\)$/;

interface ParsedLink {
  dpr: number;
  file: [number, number];
  height: number;
  orientation: string;
  width: number;
}

/**
 * React 19 hoists `<link>` out of the render container and into `document.head`
 * on its own, so these are never found where the component was mounted.
 */
const links = (): HTMLLinkElement[] => {
  render(<AppleSplashLinks />);

  return [
    ...document.head.querySelectorAll<HTMLLinkElement>(
      'link[rel="apple-touch-startup-image"]'
    ),
  ];
};

const parsed = (): ParsedLink[] =>
  links().map(link => {
    const media = MEDIA.exec(link.getAttribute('media') ?? '');
    const file = /apple-splash-(\d+)-(\d+)\.png$/.exec(
      link.getAttribute('href') ?? ''
    );

    if (!media || !file) {
      throw new Error(`unparseable link: ${link.outerHTML}`);
    }

    return {
      dpr: Number(media[3]),
      file: [Number(file[1]), Number(file[2])],
      height: Number(media[2]),
      orientation: media[4],
      width: Number(media[1]),
    };
  });

describe('AppleSplashLinks', () => {
  it('emits a portrait and a landscape link for every device class', () => {
    const parsedLinks = parsed();

    // Asserted against a floor rather than an exact count: the table grows
    // with Apple's hardware, but an empty render must never pass the
    // per-link assertions below vacuously.
    expect(parsedLinks.length).toBeGreaterThanOrEqual(30);
    expect(parsedLinks.length % 2).toBe(0);

    const classes = new Set(
      parsedLinks.map(({ dpr, height, width }) => `${width}x${height}@${dpr}`)
    );

    expect(classes.size).toBe(parsedLinks.length / 2);
  });

  it('sizes each image at the device points multiplied by its pixel ratio', () => {
    const parsedLinks = parsed();

    expect(parsedLinks.length).toBeGreaterThanOrEqual(30);

    for (const { dpr, file, height, orientation, width } of parsedLinks) {
      const short = width * dpr;
      const long = height * dpr;

      expect(file).toEqual(
        orientation === 'portrait' ? [short, long] : [long, short]
      );
    }
  });

  it('never repeats an href or a media query', () => {
    const rendered = links();
    const hrefs = rendered.map(link => link.getAttribute('href'));
    const medias = rendered.map(link => link.getAttribute('media'));

    // A duplicated row would shadow silently: the first match wins and the
    // second is dead weight precached into every installed app.
    expect(hrefs.length).toBeGreaterThanOrEqual(30);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(new Set(medias).size).toBe(medias.length);
  });

  it('points every link at the manifest-icons directory', () => {
    const rendered = links();

    expect(rendered.length).toBeGreaterThanOrEqual(30);

    for (const link of rendered) {
      expect(link.getAttribute('href')).toMatch(
        /^\/images\/manifest-icons\/apple-splash-\d+-\d+\.png$/
      );
    }
  });
});
