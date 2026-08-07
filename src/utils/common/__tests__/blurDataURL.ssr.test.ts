/**
 * @jest-environment node
 */
import { blurDataURL, shimmer } from '@utils/common';

describe('blurDataURL (SSR)', () => {
  it('base64-encodes via Buffer when window is unavailable, as on the server', () => {
    const dataUrl = blurDataURL(200, 100);
    const [, encoded] = dataUrl.split('base64,');
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');

    expect(decoded).toBe(shimmer(200, 100));
  });
});
