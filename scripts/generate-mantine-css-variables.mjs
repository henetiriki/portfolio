import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// Named to avoid the module wrapper's own `__dirname` parameter: Jest's
// CommonJS transform of this ESM file puts this declaration inside a function
// scope that already binds `__dirname`, so reusing that name is a duplicate
// declaration there even though it's fine under real ESM execution.
const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(moduleDir, '..');
const sourcePath = path.join(projectRoot, 'src/styles/colors.ts');
const outputPath = path.join(
  projectRoot,
  'src/styles/mantine-custom-properties.css'
);

const getPropertyName = (propertyName, sourceFile) => {
  if (ts.isIdentifier(propertyName) || ts.isStringLiteral(propertyName)) {
    return propertyName.text;
  }

  if (
    ts.isComputedPropertyName(propertyName) &&
    ts.isStringLiteral(propertyName.expression)
  ) {
    return propertyName.expression.text;
  }

  throw new Error(
    `Unsupported color name syntax: ${propertyName.getText(sourceFile)}`
  );
};

// Pure: parses `colorOverrides` out of `colors.ts`'s own text via the
// TypeScript compiler API — the same approach `generate-pwa-icons.mjs` uses
// for `SPLASH_DEVICES` — and returns one `--mantine-color-<name>-<shade>`
// declaration per array entry, so it can be tested against a literal snippet
// instead of the real file.
export const extractColorDeclarations = (sourceText, label = 'colors.ts') => {
  const sourceFile = ts.createSourceFile(
    label,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  const colorDeclaration = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap(statement => statement.declarationList.declarations)
    .find(
      declaration => declaration.name.getText(sourceFile) === 'colorOverrides'
    );

  if (
    !colorDeclaration ||
    !ts.isObjectLiteralExpression(colorDeclaration.initializer)
  ) {
    throw new Error(`Could not find the colorOverrides object in ${label}`);
  }

  return colorDeclaration.initializer.properties.flatMap(property => {
    if (
      !ts.isPropertyAssignment(property) ||
      !ts.isArrayLiteralExpression(property.initializer)
    ) {
      return [];
    }

    const colorName = getPropertyName(property.name, sourceFile);

    return property.initializer.elements.map((element, shade) => {
      if (!ts.isStringLiteral(element)) {
        throw new Error(`${colorName}.${shade} must be a string literal`);
      }

      return `  --mantine-color-${colorName}-${shade}: ${element.text.toLowerCase()};`;
    });
  });
};

export const renderCss = declarations =>
  [':root {', ...declarations, '}', ''].join('\n');

/* istanbul ignore next -- CLI entry point; exercised by running the script, not by importing it under test */
const main = () => {
  const isCheckMode = process.argv.includes('--check');

  // Skipped on Vercel because this file exists only for local WebStorm CSS
  // analysis and is never imported at runtime — a deployed build has no use
  // for it. `!isCheckMode` because a blanket return would make `--check` pass
  // without checking; `writeSync` because `process.exit` drops a buffered
  // `console.log`.
  if (process.env.VERCEL && !isCheckMode) {
    fs.writeSync(
      1,
      'VERCEL is set: skipping the WebStorm CSS-variable stub.\n'
    );
    process.exit(0);
  }

  const sourceText = fs.readFileSync(sourcePath, 'utf8');
  const output = renderCss(extractColorDeclarations(sourceText, sourcePath));

  if (isCheckMode) {
    const currentOutput = fs.existsSync(outputPath)
      ? fs.readFileSync(outputPath, 'utf8')
      : '';

    if (currentOutput !== output) {
      console.error(
        'Mantine CSS custom properties are stale. Run yarn css-vars:generate.'
      );
      process.exitCode = 1;
    }
  } else {
    fs.writeFileSync(outputPath, output);
    console.log(`Generated ${path.relative(projectRoot, outputPath)}`);
  }
};

/* istanbul ignore next -- CLI entry point; exercised by running the script, not by importing it under test */
if (process.argv.at(1)?.endsWith('generate-mantine-css-variables.mjs')) {
  main();
}
