const mockImportLibrary = jest.fn();
const mockSetOptions = jest.fn();

jest.mock('@googlemaps/js-api-loader', () => ({
  importLibrary: mockImportLibrary,
  setOptions: mockSetOptions,
}));

const importLoader = async () => {
  jest.resetModules();

  return import('@utils/googleMaps');
};

describe('loadGoogleMaps', () => {
  beforeEach(() => {
    mockImportLibrary.mockReset();
    mockSetOptions.mockReset();
  });

  it('configures Google once and loads the maps and geometry libraries', async () => {
    mockImportLibrary.mockResolvedValue({});
    const { loadGoogleMaps } = await importLoader();

    await loadGoogleMaps();

    expect(mockSetOptions).toHaveBeenCalledTimes(1);
    expect(mockSetOptions).toHaveBeenCalledWith({
      key: 'test-google-maps-api-key',
      v: 'weekly',
    });
    expect(mockImportLibrary).toHaveBeenNthCalledWith(1, 'maps');
    expect(mockImportLibrary).toHaveBeenNthCalledWith(2, 'geometry');
  });

  it('deduplicates concurrent and subsequent load requests', async () => {
    mockImportLibrary.mockResolvedValue({});
    const { loadGoogleMaps } = await importLoader();

    await Promise.all([loadGoogleMaps(), loadGoogleMaps(), loadGoogleMaps()]);
    await loadGoogleMaps();

    expect(mockSetOptions).toHaveBeenCalledTimes(1);
    expect(mockImportLibrary).toHaveBeenCalledTimes(2);
  });

  it('allows a failed load to be retried without resetting options', async () => {
    mockImportLibrary.mockRejectedValueOnce(new Error('Load failed'));
    mockImportLibrary.mockResolvedValue({});
    const { loadGoogleMaps } = await importLoader();

    await expect(loadGoogleMaps()).rejects.toThrow('Load failed');
    await expect(loadGoogleMaps()).resolves.toBeUndefined();

    expect(mockSetOptions).toHaveBeenCalledTimes(1);
    expect(mockImportLibrary).toHaveBeenCalledTimes(4);
  });
});
