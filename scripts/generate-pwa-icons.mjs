import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import ts from 'typescript';

import { projectRootFrom } from './lib/project-root.mjs';
import { findTopLevelConst } from './lib/typescript-source.mjs';

const projectRoot = projectRootFrom(import.meta.url);

const splashDevicesPath = path.join(
  projectRoot,
  'src/components/shared/AppleSplashLinks.tsx'
);
const svgPath = path.join(projectRoot, 'public/images/ouwl.svg');
const outputDir = path.join(projectRoot, 'public/images/manifest-icons');

// Matches --mantine-color-black-russian-4 / `theme_color` / `background_color`.
const NAVY = { alpha: 1, b: 32, g: 10, r: 8 };
const TRANSPARENT = { alpha: 0, b: 0, g: 0, r: 0 };

// The `any` and maskable purposes need deliberately different scale, not just
// different padding. Monochrome shares the maskable scale
// because Android applies the same safe-zone masking to it.
const ANY_SCALE = 0.62;
const MASKABLE_SCALE = 0.55;
const SPLASH_SCALE = 0.35;

const ORIENTATIONS = ['portrait', 'landscape'];

/**
 * Reads `SPLASH_DEVICES` out of the given source text via the TypeScript
 * compiler API, the same approach `generate-mantine-css-variables.mjs` uses
 * for `colorOverrides` — one source of truth for the device table rather than
 * a copy that can silently drift from what the app actually links. Pure, so
 * it can be tested against a literal snippet instead of the real file.
 */
export const readSplashDevicesFromSource = (
  sourceText,
  label = 'AppleSplashLinks.tsx'
) => {
  const { declaration } = findTopLevelConst(
    sourceText,
    label,
    'SPLASH_DEVICES',
    ts.ScriptKind.TSX
  );

  if (
    !declaration?.initializer ||
    !ts.isArrayLiteralExpression(declaration.initializer)
  ) {
    throw new Error(`Could not find SPLASH_DEVICES in ${label}`);
  }

  return declaration.initializer.elements.map(element => {
    if (!ts.isObjectLiteralExpression(element)) {
      throw new Error('Each SPLASH_DEVICES entry must be an object literal');
    }

    const device = {};

    for (const property of element.properties) {
      if (
        !ts.isPropertyAssignment(property) ||
        !ts.isIdentifier(property.name)
      ) {
        throw new Error('Unsupported SPLASH_DEVICES property syntax');
      }

      if (!ts.isNumericLiteral(property.initializer)) {
        throw new Error(`${property.name.text} must be a numeric literal`);
      }

      device[property.name.text] = Number(property.initializer.text);
    }

    return device;
  });
};

/**
 * One target per device class per orientation, keyed by the filename
 * `AppleSplashLinks` links to — mirrors that component's own derivation
 * exactly (`docs/pwa-seo.md`), so the two cannot drift apart.
 */
export const splashTargetsFor = devices => {
  const targets = new Map();

  for (const { dpr, height, width } of devices) {
    for (const orientation of ORIENTATIONS) {
      const long = height * dpr;
      const short = width * dpr;
      const [targetWidth, targetHeight] =
        orientation === 'portrait' ? [short, long] : [long, short];
      const file = `apple-splash-${targetWidth}-${targetHeight}.png`;

      targets.set(file, { height: targetHeight, width: targetWidth });
    }
  }

  return targets;
};

const STATIC_ICON_TARGETS = new Map([
  [
    'manifest-icon-192.png',
    { background: NAVY, height: 192, scale: ANY_SCALE, width: 192 },
  ],
  [
    'manifest-icon-512.png',
    { background: NAVY, height: 512, scale: ANY_SCALE, width: 512 },
  ],
  [
    'manifest-icon-192.maskable.png',
    { background: NAVY, height: 192, scale: MASKABLE_SCALE, width: 192 },
  ],
  [
    'manifest-icon-512.maskable.png',
    { background: NAVY, height: 512, scale: MASKABLE_SCALE, width: 512 },
  ],
  [
    'manifest-icon-192.monochrome.png',
    {
      background: TRANSPARENT,
      height: 192,
      monochrome: true,
      scale: MASKABLE_SCALE,
      width: 192,
    },
  ],
  [
    'manifest-icon-512.monochrome.png',
    {
      background: TRANSPARENT,
      height: 512,
      monochrome: true,
      scale: MASKABLE_SCALE,
      width: 512,
    },
  ],
  [
    'apple-icon-180.png',
    { background: NAVY, height: 180, scale: ANY_SCALE, width: 180 },
  ],
]);

// Only the splash files are table-driven — the static icon list above never
// changes size — so an "orphan" (a generated file with no target) can only
// arise here, when a device is removed from SPLASH_DEVICES.
export const SPLASH_FILENAME = /^apple-splash-\d+-\d+\.png$/;

/**
 * The static icon table plus one entry per splash target, all sharing the
 * splash scale/background — pure composition, so it is tested independently
 * of both the TypeScript parsing above and the rendering below.
 */
export const buildIconTargets = splashTargets => {
  const targets = new Map(STATIC_ICON_TARGETS);

  for (const [file, target] of splashTargets) {
    targets.set(file, { ...target, background: NAVY, scale: SPLASH_SCALE });
  }

  return targets;
};

/**
 * Rasterises the master SVG at `size × size`, transparent, uncomposited.
 *
 * `monochrome` recolours the eye fill to match the owl outline before
 * rendering, collapsing the two-colour mark into the flat single-colour
 * silhouette Android's themed-icon alpha mask needs.
 */
/* istanbul ignore next -- real sharp rendering; exercised by running the script, not by importing it under test */
const renderOwl = (size, { monochrome = false } = {}) => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- `svgPath` is a module-level constant built from `projectRootFrom(import.meta.url)`, not external input
  const svgText = fs.readFileSync(svgPath, 'utf8');
  const source = monochrome
    ? svgText.replaceAll('fill="#27e278"', 'fill="#ffffff"')
    : svgText;

  return sharp(Buffer.from(source))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
};

/**
 * Centres the rendered owl on a `width × height` canvas of `background`.
 * `scale` is the owl's rendered box as a fraction of the canvas's short edge,
 * matching how `AppleSplashLinks` and the manifest icons already read.
 */
/* istanbul ignore next -- real sharp rendering; exercised by running the script, not by importing it under test */
const renderIcon = async ({
  background,
  height,
  monochrome = false,
  scale,
  width,
}) => {
  const owlSize = Math.round(Math.min(width, height) * scale);
  const owl = await renderOwl(owlSize, { monochrome });

  return sharp({ create: { background, channels: 4, height, width } })
    .composite([{ gravity: 'center', input: owl }])
    .png({ compressionLevel: 9 })
    .toBuffer();
};

/* istanbul ignore next -- real file writes; exercised by running the script, not by importing it under test */
const writeAll = async targets => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- `outputDir` is a module-level constant built from `projectRootFrom(import.meta.url)`, not external input
  fs.mkdirSync(outputDir, { recursive: true });

  for (const [file, target] of targets) {
    const buffer = await renderIcon(target);

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- `file` is always a key from the static tables above, never external input
    fs.writeFileSync(path.join(outputDir, file), buffer);
  }

  console.log(
    `Generated ${targets.size} icon and splash assets in ${path.relative(projectRoot, outputDir)}`
  );
};

/**
 * Verifies internal consistency between `SPLASH_DEVICES`/`ouwl.svg` and the
 * committed assets — not device *coverage*, which has no source to check
 * against and is deliberately left to manual review.
 */
/* istanbul ignore next -- real file reads and rendering; exercised by running the script, not by importing it under test */
const checkAll = async targets => {
  const problems = [];

  for (const [file, target] of targets) {
    const expected = await renderIcon(target);
    const filePath = path.join(outputDir, file);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- `filePath` is always built from the same static tables as writeAll above
    const actual = fs.existsSync(filePath)
      ? // eslint-disable-next-line security/detect-non-literal-fs-filename -- `filePath` is always built from the same static tables as writeAll above
        fs.readFileSync(filePath)
      : null;

    if (!actual) {
      problems.push(`missing: ${file}`);
    } else if (!expected.equals(actual)) {
      problems.push(`stale: ${file}`);
    }
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- `outputDir` is a module-level constant built from `projectRootFrom(import.meta.url)`, not external input
  if (fs.existsSync(outputDir)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- as above
    for (const name of fs.readdirSync(outputDir)) {
      if (SPLASH_FILENAME.test(name) && !targets.has(name)) {
        problems.push(`orphaned: ${name} (no matching SPLASH_DEVICES entry)`);
      }
    }
  }

  if (problems.length > 0) {
    console.error(
      'PWA icon and splash assets are out of date with SPLASH_DEVICES and ouwl.svg. Run yarn icons:generate.'
    );

    for (const problem of problems.sort()) {
      console.error(`  ${problem}`);
    }

    process.exitCode = 1;
  } else {
    console.log(`All ${targets.size} icon and splash assets are up to date.`);
  }
};

/* istanbul ignore next -- CLI entry point; exercised by running the script, not by importing it under test */
const main = async () => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- `splashDevicesPath` is a module-level constant built from `projectRootFrom(import.meta.url)`, not external input
  const sourceText = fs.readFileSync(splashDevicesPath, 'utf8');
  const devices = readSplashDevicesFromSource(sourceText, splashDevicesPath);
  const targets = buildIconTargets(splashTargetsFor(devices));

  if (process.argv.includes('--check')) {
    await checkAll(targets);
  } else {
    await writeAll(targets);
  }
};

// Not `await`-ed: Jest's transform of this ESM file cannot parse a top-level
// `await` inside a conditional, only a bare one — and a real run still waits
// for this regardless, since the pending file writes and sharp calls keep the
// event loop alive until it settles.
/* istanbul ignore next -- CLI entry point; exercised by running the script, not by importing it under test */
if (process.argv.at(1)?.endsWith('generate-pwa-icons.mjs')) {
  main().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
