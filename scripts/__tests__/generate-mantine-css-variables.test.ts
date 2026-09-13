import {
  extractColorDeclarations,
  renderCss,
} from '../generate-mantine-css-variables.mjs';

describe('extractColorDeclarations', () => {
  it('emits one declaration per shade, lowercasing the hex value', () => {
    const source = `
      export const colorOverrides = {
        shamrock: ['#27E278', '#1FB560'],
      };
    `;

    expect(extractColorDeclarations(source)).toEqual([
      '  --mantine-color-shamrock-0: #27e278;',
      '  --mantine-color-shamrock-1: #1fb560;',
    ]);
  });

  it('reads a computed string-literal key the same as an identifier key', () => {
    const source = `
      export const colorOverrides = {
        ['torch-red']: ['#FA233E'],
      };
    `;

    expect(extractColorDeclarations(source)).toEqual([
      '  --mantine-color-torch-red-0: #fa233e;',
    ]);
  });

  it('skips a property whose value is not an array literal', () => {
    const source = `
      export const colorOverrides = {
        shamrock: someHelper(),
      };
    `;

    expect(extractColorDeclarations(source)).toEqual([]);
  });

  it('throws when colorOverrides is missing', () => {
    expect(() => extractColorDeclarations('export const other = {};')).toThrow(
      'Could not find the colorOverrides object'
    );
  });

  it('names the file in the error when a label is given', () => {
    expect(() =>
      extractColorDeclarations('export const other = {};', 'colors.ts')
    ).toThrow('colors.ts');
  });

  it('throws when a shade is not a string literal', () => {
    const source = `
      export const colorOverrides = {
        shamrock: [123],
      };
    `;

    expect(() => extractColorDeclarations(source)).toThrow(
      'shamrock.0 must be a string literal'
    );
  });

  it('throws on an unsupported color name syntax', () => {
    const source = `
      export const colorOverrides = {
        [1 + 1]: ['#27E278'],
      };
    `;

    expect(() => extractColorDeclarations(source)).toThrow(
      'Unsupported color name syntax'
    );
  });
});

describe('renderCss', () => {
  it('wraps the declarations in a :root block', () => {
    expect(renderCss(['  --mantine-color-shamrock-0: #27e278;'])).toBe(
      ':root {\n  --mantine-color-shamrock-0: #27e278;\n}\n'
    );
  });

  it('still closes the block with no declarations', () => {
    expect(renderCss([])).toBe(':root {\n}\n');
  });
});
