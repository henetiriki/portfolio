import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(projectRoot, 'src/styles/colors.ts');
const outputPath = path.join(
  projectRoot,
  'src/styles/mantine-custom-properties.css'
);
const isCheckMode = process.argv.includes('--check');

// A Vercel build has no IDE to serve the stub to, so `postinstall` generating it
// there can only cost time or fail the deploy. Deliberately not a blanket early
// return: `--check` must still run, or it would pass without checking anything.
// See docs/decisions/2026-09-07-skip-the-webstorm-css-stub-on-vercel.md.
if (process.env.VERCEL && !isCheckMode) {
  console.log('VERCEL is set: skipping the WebStorm CSS-variable stub.');
  process.exit(0);
}

const sourceText = fs.readFileSync(sourcePath, 'utf8');
const sourceFile = ts.createSourceFile(
  sourcePath,
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
  throw new Error(`Could not find the colorOverrides object in ${sourcePath}`);
}

const getPropertyName = propertyName => {
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

const declarations = colorDeclaration.initializer.properties.flatMap(
  property => {
    if (
      !ts.isPropertyAssignment(property) ||
      !ts.isArrayLiteralExpression(property.initializer)
    ) {
      return [];
    }

    const colorName = getPropertyName(property.name);

    return property.initializer.elements.map((element, shade) => {
      if (!ts.isStringLiteral(element)) {
        throw new Error(`${colorName}.${shade} must be a string literal`);
      }

      return `  --mantine-color-${colorName}-${shade}: ${element.text.toLowerCase()};`;
    });
  }
);

const output = [':root {', ...declarations, '}', ''].join('\n');

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
