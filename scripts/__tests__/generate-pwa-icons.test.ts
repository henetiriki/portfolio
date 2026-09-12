import {
  SPLASH_FILENAME,
  buildIconTargets,
  readSplashDevicesFromSource,
  splashTargetsFor,
} from '../generate-pwa-icons.mjs';

describe('SPLASH_FILENAME', () => {
  it('matches a generated splash filename', () => {
    expect(SPLASH_FILENAME.test('apple-splash-750-1334.png')).toBe(true);
  });

  it('does not match a static icon filename', () => {
    expect(SPLASH_FILENAME.test('manifest-icon-192.png')).toBe(false);
  });
});

describe('readSplashDevicesFromSource', () => {
  it('reads dpr/height/width off each SPLASH_DEVICES entry', () => {
    const source = `
      export const SPLASH_DEVICES = [
        { dpr: 3, height: 852, width: 393 },
        { dpr: 2, height: 667, width: 375 },
      ];
    `;

    expect(readSplashDevicesFromSource(source)).toEqual([
      { dpr: 3, height: 852, width: 393 },
      { dpr: 2, height: 667, width: 375 },
    ]);
  });

  it('throws when SPLASH_DEVICES is missing', () => {
    expect(() =>
      readSplashDevicesFromSource('export const other = [];')
    ).toThrow('Could not find SPLASH_DEVICES');
  });

  it('throws when an entry is not an object literal', () => {
    expect(() =>
      readSplashDevicesFromSource('export const SPLASH_DEVICES = [1];')
    ).toThrow('Each SPLASH_DEVICES entry must be an object literal');
  });

  it('throws on an unsupported property syntax', () => {
    const source = `
      export const SPLASH_DEVICES = [{ ...spread }];
    `;

    expect(() => readSplashDevicesFromSource(source)).toThrow(
      'Unsupported SPLASH_DEVICES property syntax'
    );
  });

  it('throws when a property is not a numeric literal', () => {
    const source = `
      export const SPLASH_DEVICES = [{ dpr: 'three' }];
    `;

    expect(() => readSplashDevicesFromSource(source)).toThrow(
      'dpr must be a numeric literal'
    );
  });
});

describe('splashTargetsFor', () => {
  it('produces a portrait and a landscape target per device, scaled by dpr', () => {
    const targets = splashTargetsFor([{ dpr: 2, height: 667, width: 375 }]);

    expect(targets.get('apple-splash-750-1334.png')).toEqual({
      height: 1334,
      width: 750,
    });
    expect(targets.get('apple-splash-1334-750.png')).toEqual({
      height: 750,
      width: 1334,
    });
    expect(targets.size).toBe(2);
  });
});

describe('buildIconTargets', () => {
  it('includes the static targets untouched', () => {
    const targets = buildIconTargets(new Map());

    expect(targets.get('apple-icon-180.png')).toEqual({
      background: { alpha: 1, b: 32, g: 10, r: 8 },
      height: 180,
      scale: 0.62,
      width: 180,
    });
  });

  it('adds each splash target with the splash background and scale', () => {
    const splashTargets = new Map([
      ['apple-splash-750-1334.png', { height: 1334, width: 750 }],
    ]);

    const targets = buildIconTargets(splashTargets);

    expect(targets.get('apple-splash-750-1334.png')).toEqual({
      background: { alpha: 1, b: 32, g: 10, r: 8 },
      height: 1334,
      scale: 0.35,
      width: 750,
    });
  });
});
