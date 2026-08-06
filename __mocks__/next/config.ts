const publicRuntimeConfig = {
  googleApiKey: 'test-google-maps-api-key',
  imgHost: 'http://localhost:3000/images',
  lastModified: 'test',
  siteUrl: 'http://localhost:3000',
};

const serverRuntimeConfig = {
  igImgIds: 'test-img-id',
};

const getConfig = () => ({ publicRuntimeConfig, serverRuntimeConfig });

export default getConfig;
