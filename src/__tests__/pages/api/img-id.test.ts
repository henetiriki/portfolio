import handler from '@pages/api/img-id';
import { createMockApiContext } from '@utils/test/apiContext';

describe('img-id API handler', () => {
  const originalIgImgIds = process.env.ISTAGRAM_IMAGE_IDS;

  afterEach(() => {
    process.env.ISTAGRAM_IMAGE_IDS = originalIgImgIds;
  });

  it('responds 200 with one of the configured image ids', async () => {
    process.env.ISTAGRAM_IMAGE_IDS = 'id-1,id-2,id-3';
    const { json, req, res, status } = createMockApiContext();

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      imgId: expect.stringMatching(/^id-[123]$/),
    });
  });

  it('keeps returning a valid image id across more calls than there are configured ids (regression test for the pool-depletion bug)', async () => {
    process.env.ISTAGRAM_IMAGE_IDS = 'id-1,id-2,id-3';

    for (let i = 0; i < 10; i += 1) {
      const { json, req, res } = createMockApiContext();

      await handler(req, res);

      expect(json).toHaveBeenCalledWith({
        imgId: expect.stringMatching(/^id-[123]$/),
      });
    }
  });

  it('responds with an undefined imgId when no image ids are configured', async () => {
    delete process.env.ISTAGRAM_IMAGE_IDS;

    const { json, req, res, status } = createMockApiContext();

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ imgId: undefined });
  });
});
