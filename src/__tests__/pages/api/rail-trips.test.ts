import { railTrips } from '@fixtures/travel';
import handler from '@pages/api/rail-trips';
import { createMockApiContext } from '@utils/test/apiContext';

describe('rail-trips API handler', () => {
  it('responds 200 with the static rail trips fixture', async () => {
    const { json, req, res, status } = createMockApiContext();

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(railTrips);
  });
});
