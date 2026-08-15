import type { FC, JSX } from 'react';

interface SplashDevice {
  /** `-webkit-device-pixel-ratio` the device reports. */
  dpr: number;
  /** Portrait height in CSS points. */
  height: number;
  /** Portrait width in CSS points. */
  width: number;
}

/**
 * Every Apple device class with a launch screen, portrait points and pixel
 * ratio. A class absent from this table gets no splash at all, silently — see
 * `docs/pwa-seo.md`. Ordered by pixel ratio, then width.
 */
const SPLASH_DEVICES: SplashDevice[] = [
  { dpr: 2, height: 568, width: 320 },
  { dpr: 2, height: 667, width: 375 },
  { dpr: 2, height: 896, width: 414 },
  { dpr: 2, height: 1133, width: 744 },
  { dpr: 2, height: 1024, width: 768 },
  { dpr: 2, height: 1080, width: 810 },
  { dpr: 2, height: 1180, width: 820 },
  { dpr: 2, height: 1112, width: 834 },
  { dpr: 2, height: 1194, width: 834 },
  { dpr: 2, height: 1366, width: 1024 },
  { dpr: 2, height: 1376, width: 1032 },
  { dpr: 3, height: 812, width: 375 },
  { dpr: 3, height: 844, width: 390 },
  { dpr: 3, height: 852, width: 393 },
  { dpr: 3, height: 874, width: 402 },
  { dpr: 3, height: 736, width: 414 },
  { dpr: 3, height: 896, width: 414 },
  { dpr: 3, height: 912, width: 420 },
  { dpr: 3, height: 926, width: 428 },
  { dpr: 3, height: 932, width: 430 },
  { dpr: 3, height: 956, width: 440 },
];

const ORIENTATIONS = ['portrait', 'landscape'] as const;

export const AppleSplashLinks: FC = (): JSX.Element => (
  <>
    {SPLASH_DEVICES.flatMap(({ dpr, height, width }) =>
      ORIENTATIONS.map(orientation => {
        const long = height * dpr;
        const short = width * dpr;
        const file =
          orientation === 'portrait' ? `${short}-${long}` : `${long}-${short}`;

        return (
          <link
            href={`/images/manifest-icons/apple-splash-${file}.png`}
            key={`${width}-${height}-${dpr}-${orientation}`}
            media={`(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: ${orientation})`}
            rel='apple-touch-startup-image'
          />
        );
      })
    )}
  </>
);
