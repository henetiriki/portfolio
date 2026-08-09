import type { NextApiRequest, NextApiResponse } from 'next';

export const createMockApiContext = (
  body?: unknown,
  request: Partial<NextApiRequest> = {}
) => {
  const json = jest.fn();
  const setHeader = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const req = { body, method: 'POST', ...request } as NextApiRequest;
  const res = { json, setHeader, status } as unknown as NextApiResponse;

  return { json, req, res, setHeader, status };
};
