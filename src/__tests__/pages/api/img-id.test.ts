import handler from '@pages/api/img-id';
import { createMockApiContext } from '@utils/test/apiContext';

describe('img-id API handler', () => {
  const originalIgImgIds = process.env.ISTAGRAM_IMAGE_IDS;

  afterEach(() => {
    process.env.ISTAGRAM_IMAGE_IDS = originalIgImgIds;
  });

  it('responds 200 with one of the configured image ids', async () => {
    process.env.ISTAGRAM_IMAGE_IDS = 'id-1,id-2,id-3';
    const { json, req, res, setHeader, status } = createMockApiContext(
      undefined,
      { method: 'GET' }
    );

    handler(req, res);

    expect(setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'private, no-store'
    );
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      imgId: expect.stringMatching(/^id-[123]$/),
    });
  });

  it('keeps returning a valid image id across more calls than there are configured ids (regression test for the pool-depletion bug)', async () => {
    process.env.ISTAGRAM_IMAGE_IDS = 'id-1,id-2,id-3';

    for (let i = 0; i < 10; i += 1) {
      const { json, req, res } = createMockApiContext();

      req.method = 'GET';

      handler(req, res);

      expect(json).toHaveBeenCalledWith({
        imgId: expect.stringMatching(/^id-[123]$/),
      });
    }
  });

  it.each([undefined, '', ' , '])(
    'responds 503 when image ids are missing or empty (%p)',
    async imageIds => {
      if (imageIds === undefined) {
        delete process.env.ISTAGRAM_IMAGE_IDS;
      } else {
        process.env.ISTAGRAM_IMAGE_IDS = imageIds;
      }

      const { json, req, res, status } = createMockApiContext(undefined, {
        method: 'GET',
      });

      handler(req, res);

      expect(status).toHaveBeenCalledWith(503);
      expect(json).toHaveBeenCalledWith({ error: 'Service unavailable' });
    }
  );

  it('trims configured ids and ignores empty entries', async () => {
    process.env.ISTAGRAM_IMAGE_IDS = ' , id-only, ';
    const { json, req, res } = createMockApiContext(undefined, {
      method: 'GET',
    });

    handler(req, res);

    expect(json).toHaveBeenCalledWith({ imgId: 'id-only' });
  });

  it('rejects non-GET methods', async () => {
    delete process.env.ISTAGRAM_IMAGE_IDS;

    const { json, req, res, setHeader, status } = createMockApiContext();

    handler(req, res);

    expect(setHeader).toHaveBeenCalledWith('Allow', 'GET');
    expect(status).toHaveBeenCalledWith(405);
    expect(json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });
});
