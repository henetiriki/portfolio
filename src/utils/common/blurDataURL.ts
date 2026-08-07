export const shimmer = (w: number, h: number): string => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#252740" offset="20%" />
      <stop stop-color="#080a20" offset="50%" />
      <stop stop-color="#252740" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#252740" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string): string =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export const blurDataURL = (
  w: number = 1920,
  h: number = 1080
): `data:image/${string}` =>
  `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;
