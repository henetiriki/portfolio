import ts from 'typescript';

/**
 * The top-level `const <name> = …` declaration in `sourceText`, plus the
 * parsed `sourceFile`. `declaration` is `undefined` when there is none.
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
