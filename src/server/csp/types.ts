export type CspViolation = {
  blockedUri: string;
  directive: string;
  documentUri: string;
  sourceFile?: string;
};
