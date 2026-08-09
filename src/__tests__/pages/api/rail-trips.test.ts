import { railTrips } from '@fixtures/travel';
import handler from '@pages/api/rail-trips';
import { createMockApiContext } from '@utils/test/apiContext';

describe('rail-trips API handler', () => {
  it('responds 200 with the static rail trips fixture', async () => {
    const { json, req, res, setHeader, status } = createMockApiContext(
      undefined,
      { method: 'GET' }
    );

    handler(req, res);

    expect(setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800'
    );
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(railTrips);
  });

  it('rejects non-GET methods without caching the error', async () => {
    const { json, req, res, setHeader, status } = createMockApiContext();

    handler(req, res);

    expect(setHeader).toHaveBeenCalledWith('Allow', 'GET');
    expect(setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'private, no-store'
    );
    expect(status).toHaveBeenCalledWith(405);
    expect(json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });
});
