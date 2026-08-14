import type { CspViolation } from './types';
import type { NextApiRequest } from 'next';

const MAX_REPORT_BYTES = 16 * 1024;

const EXTENSION_SCHEMES = [
  'chrome-extension:',
  'moz-extension:',
  'safari-extension:',
  'safari-web-extension:',
];

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value ? value : undefined;

// `report-uri` posts a single object under a `csp-report` key, with
// hyphenated field names. See docs/decisions.md#d-260814c.
const fromReportUri = (parsed: unknown): CspViolation[] => {
  const report = asRecord(asRecord(parsed)?.['csp-report']);

  if (!report) {
    return [];
  }

  return [
    {
      blockedUri: asString(report['blocked-uri']) ?? 'unknown',
      directive:
        asString(report['effective-directive']) ??
        asString(report['violated-directive']) ??
        'unknown',
      documentUri: asString(report['document-uri']) ?? 'unknown',
      sourceFile: asString(report['source-file']),
    },
  ];
};

export const readReportBody = async (req: NextApiRequest): Promise<string> => {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of req) {
    const buffer = Buffer.from(chunk as Buffer);

    size += buffer.byteLength;

    if (size > MAX_REPORT_BYTES) {
      throw new Error('CSP report body exceeds the accepted size');
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks).toString('utf8');
};

export const parseViolations = (raw: string): CspViolation[] => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  return fromReportUri(parsed);
};

// Extension-injected scripts violate the policy on every page and cannot be
// fixed from here; they are dropped so they cannot drown the signal this
// rollout is judged on. See docs/decisions.md#d-260814c.
export const isReportable = ({
  blockedUri,
  sourceFile,
}: CspViolation): boolean =>
  ![blockedUri, sourceFile].some(value =>
    EXTENSION_SCHEMES.some(scheme => value?.startsWith(scheme))
  );

export const logViolation = ({
  blockedUri,
  directive,
  documentUri,
  sourceFile,
}: CspViolation): void => {
  const origin = sourceFile ? ` from ${sourceFile}` : '';

  console.warn(
    `CSP violation: ${directive} blocked ${blockedUri} on ${documentUri}${origin}`
  );
};
