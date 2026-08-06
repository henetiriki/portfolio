import type { NextApiRequest, NextApiResponse } from 'next';

export const createMockApiContext = (body?: unknown) => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const req = { body } as NextApiRequest;
  const res = { json, status } as unknown as NextApiResponse;

  return { json, req, res, status };
};
