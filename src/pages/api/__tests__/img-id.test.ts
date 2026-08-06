import handler from '@pages/api/img-id';
import { createMockApiContext } from '@utils/test/apiContext';

jest.mock('next/config', () => ({
  __esModule: true,
  default: () => ({
    serverRuntimeConfig: { igImgIds: 'id-1,id-2,id-3' },
  }),
}));

describe('img-id API handler', () => {
  it('responds 200 with one of the configured image ids', async () => {
    const { json, req, res, status } = createMockApiContext();

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      imgId: expect.stringMatching(/^id-[123]$/),
    });
  });

  it('keeps returning a valid image id across more calls than there are configured ids (regression test for the pool-depletion bug)', async () => {
    for (let i = 0; i < 10; i += 1) {
      const { json, req, res } = createMockApiContext();

      await handler(req, res);

      expect(json).toHaveBeenCalledWith({
        imgId: expect.stringMatching(/^id-[123]$/),
      });
    }
  });

  it('responds with an undefined imgId when no image ids are configured', async () => {
    jest.resetModules();
    jest.doMock('next/config', () => ({
      __esModule: true,
      default: () => ({ serverRuntimeConfig: { igImgIds: undefined } }),
    }));

    const { default: freshHandler } = await import('@pages/api/img-id');
    const { json, req, res, status } = createMockApiContext();

    await freshHandler(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ imgId: undefined });
  });
});
