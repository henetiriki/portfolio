import ts from 'typescript';

/**
 * The top-level `const <name> = …` declaration in `sourceText`, alongside the
 * parsed `sourceFile` a caller's own error messages may need to render
 * another node's text against. `declaration` is `undefined` when there is no
 * such top-level const — callers decide what that means for them.
 *
 * Shared by `generate-mantine-css-variables.mjs` (`colorOverrides`, plain
 * `.ts`) and `generate-pwa-icons.mjs` (`SPLASH_DEVICES`, `.tsx`), which
 * differ only in `scriptKind`.
 */
export const findTopLevelConst = (sourceText, label, name, scriptKind) => {
  const sourceFile = ts.createSourceFile(
    label,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );

  const declaration = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap(statement => statement.declarationList.declarations)
    .find(candidate => candidate.name.getText(sourceFile) === name);

  return { declaration, sourceFile };
};
