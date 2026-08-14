import type { NextApiRequest, NextApiResponse } from 'next';

export const createMockApiContext = (
  body?: unknown,
  request: Partial<NextApiRequest> = {}
) => {
  const end = jest.fn();
  const json = jest.fn();
  const setHeader = jest.fn();
  const status = jest.fn().mockReturnValue({ end, json });
  const req = { body, method: 'POST', ...request } as NextApiRequest;
  const res = { end, json, setHeader, status } as unknown as NextApiResponse;

  return { end, json, req, res, setHeader, status };
};
