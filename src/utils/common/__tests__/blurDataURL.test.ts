import { blurDataURL, shimmer } from '@utils/common';

describe('shimmer', () => {
  it('embeds the given width and height into the SVG markup', () => {
    const svg = shimmer(200, 100);

    expect(svg).toContain('width="200" height="100"');
  });
});

describe('blurDataURL', () => {
  it('base64-encodes the shimmer SVG for the given dimensions as a data URL', () => {
    const dataUrl = blurDataURL(200, 100);

    expect(dataUrl.startsWith('data:image/svg+xml;base64,')).toBe(true);

    const [, encoded] = dataUrl.split('base64,');
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');

    expect(decoded).toBe(shimmer(200, 100));
  });

  it('defaults to 1920x1080 when no dimensions are given', () => {
    const dataUrl = blurDataURL();
    const [, encoded] = dataUrl.split('base64,');
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');

    expect(decoded).toBe(shimmer(1920, 1080));
  });
});
