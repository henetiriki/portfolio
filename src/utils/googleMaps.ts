import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

// Always set in every real environment (dev/test/.env.local/Vercel) — see
// docs/environment-variables.md. Asserted rather than defaulted so a missing
// key fails loudly when Google rejects the request instead of silently using
// an unrelated fallback configuration.
const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

let loadPromise: Promise<void> | undefined;
let optionsSet = false;

export const loadGoogleMaps = (): Promise<void> => {
  if (!optionsSet) {
    setOptions({ key: googleApiKey, v: 'weekly' });
    optionsSet = true;
  }

  if (!loadPromise) {
    loadPromise = Promise.all([
      importLibrary('maps'),
      importLibrary('geometry'),
    ])
      .then(() => undefined)
      .catch(error => {
        loadPromise = undefined;
        throw error;
      });
  }

  return loadPromise;
};
