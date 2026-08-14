import {
  isReportable,
  logViolation,
  parseViolations,
  readReportBody,
} from '@server/csp';
import type { NextApiRequest, NextApiResponse } from 'next';

// The body is read raw because `report-uri` sends `application/csp-report`,
// which Next's body parser does not treat as JSON. See docs/decisions.md#d-260814c.
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse<void>) => {
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end();

    return;
  }

  let raw: string;

  try {
    raw = await readReportBody(req);
  } catch {
    res.status(413).end();

    return;
  }

  parseViolations(raw).filter(isReportable).forEach(logViolation);

  res.status(204).end();
};

export default handler;
