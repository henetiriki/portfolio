import handler from '@pages/api/static-map';
import { createMockApiContext } from '@utils/test/apiContext';

const originalFetch = global.fetch;

describe('static-map API handler', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('proxies the upstream image without exposing the API key to the client', async () => {
    const image = Buffer.from('fake-png-bytes');
    // Buffer.from(string) can return a view into a shared, larger pooled
    // ArrayBuffer, so the mock must slice out exactly this Buffer's own
    // range rather than handing back the whole underlying pool.
    const imageArrayBuffer = image.buffer.slice(
      image.byteOffset,
      image.byteOffset + image.byteLength
    );
    const fetchMock = jest.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(imageArrayBuffer),
      headers: new Headers({ 'content-type': 'image/png' }),
      ok: true,
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const { end, req, res, setHeader, status } = createMockApiContext(
      undefined,
      { method: 'GET' }
    );

    await handler(req, res);

    const requestedUrl = fetchMock.mock.calls[0]?.[0] as string;

    expect(requestedUrl).toContain('maps.googleapis.com/maps/api/staticmap');
    expect(setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    expect(setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
    expect(status).toHaveBeenCalledWith(200);
    expect(end).toHaveBeenCalledWith(image);
  });

  it('responds 502 without caching when the upstream request fails outright', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

    const { json, req, res, setHeader, status } = createMockApiContext(
      undefined,
      { method: 'GET' }
    );

    await handler(req, res);

    expect(setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'private, no-store'
    );
    expect(status).toHaveBeenCalledWith(502);
    expect(json).toHaveBeenCalledWith({ error: 'Static map unavailable' });
  });

  it('responds 502 without caching when the upstream response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      headers: new Headers(),
      ok: false,
    }) as unknown as typeof fetch;

    const { json, req, res, setHeader, status } = createMockApiContext(
      undefined,
      { method: 'GET' }
    );

    await handler(req, res);

    expect(setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'private, no-store'
    );
    expect(status).toHaveBeenCalledWith(502);
    expect(json).toHaveBeenCalledWith({ error: 'Static map unavailable' });
  });

  it('rejects non-GET methods without calling the upstream API', async () => {
    const fetchMock = jest.fn();

    global.fetch = fetchMock as unknown as typeof fetch;

    const { json, req, res, setHeader, status } = createMockApiContext();

    await handler(req, res);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(setHeader).toHaveBeenCalledWith('Allow', 'GET');
    expect(setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'private, no-store'
    );
    expect(status).toHaveBeenCalledWith(405);
    expect(json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });
});
