import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const splashDevicesPath = path.join(
  projectRoot,
  'src/components/shared/AppleSplashLinks.tsx'
);
const svgPath = path.join(projectRoot, 'public/images/ouwl.svg');
const outputDir = path.join(projectRoot, 'public/images/manifest-icons');

// Matches --mantine-color-black-russian-4 / `theme_color` / `background_color`
// — see docs/decisions.md#d-260815d.
const NAVY = { alpha: 1, b: 32, g: 10, r: 8 };
const TRANSPARENT = { alpha: 0, b: 0, g: 0, r: 0 };

// The `any` and maskable purposes need deliberately different scale, not just
// different padding — see docs/decisions.md#d-260815e. Monochrome shares the
// maskable scale because Android applies the same safe-zone masking to it.
const ANY_SCALE = 0.62;
const MASKABLE_SCALE = 0.55;
const SPLASH_SCALE = 0.35;

const ORIENTATIONS = ['portrait', 'landscape'];

/**
 * Reads `SPLASH_DEVICES` out of `AppleSplashLinks.tsx` via the TypeScript
 * compiler API, the same approach `generate-mantine-css-variables.mjs` uses
 * for `colorOverrides` — one source of truth for the device table rather than
 * a copy that can silently drift from what the app actually links.
 */
const readSplashDevices = () => {
  const sourceText = fs.readFileSync(splashDevicesPath, 'utf8');
  const sourceFile = ts.createSourceFile(
    splashDevicesPath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const declaration = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap(statement => statement.declarationList.declarations)
    .find(candidate => candidate.name.getText(sourceFile) === 'SPLASH_DEVICES');

  if (
    !declaration?.initializer ||
    !ts.isArrayLiteralExpression(declaration.initializer)
  ) {
    throw new Error(`Could not find SPLASH_DEVICES in ${splashDevicesPath}`);
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
const splashTargets = () => {
  const targets = new Map();

  for (const { dpr, height, width } of readSplashDevices()) {
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

/**
 * Rasterises the master SVG at `size × size`, transparent, uncomposited.
 *
 * `monochrome` recolours the eye fill to match the owl outline before
 * rendering, collapsing the two-colour mark into the flat single-colour
 * silhouette Android's themed-icon alpha mask needs — see
 * docs/decisions.md#d-260815e.
 */
const renderOwl = (size, { monochrome = false } = {}) => {
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

const iconTargets = new Map([
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

for (const [file, target] of splashTargets()) {
  iconTargets.set(file, { ...target, background: NAVY, scale: SPLASH_SCALE });
}

// Only the splash files are table-driven — the static icon list above never
// changes size — so an "orphan" (a generated file with no target) can only
// arise here, when a device is removed from SPLASH_DEVICES.
const SPLASH_FILENAME = /^apple-splash-\d+-\d+\.png$/;

const writeAll = async targets => {
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
 * against and is deliberately left to manual review. See
 * docs/decisions.md#d-260821i.
 */
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

  if (fs.existsSync(outputDir)) {
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

if (process.argv.includes('--check')) {
  await checkAll(iconTargets);
} else {
  await writeAll(iconTargets);
}
