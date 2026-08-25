export const MAP_MAX_MOBILE = 768;
export const STROKE_WEIGHT_DEFAULT = 1.25;
export const MAP_STATIC_SIZE = { height: 400, width: 640 };

const mapCenter: google.maps.LatLngLiteral = { lat: 0.0, lng: 32.0 };

const googleMapsMapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID as string;

export const mapOptions = (): google.maps.MapOptions => ({
  center: mapCenter,
  mapId: googleMapsMapId,
  mapTypeId: 'roadmap',
  restriction: {
    latLngBounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(-85, -180),
      new google.maps.LatLng(85, 180)
    ),
    strictBounds: true,
  },
  scrollwheel: false,
});

const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
const googleMapsStaticMapId = process.env
  .NEXT_PUBLIC_GOOGLE_MAPS_STATIC_MAP_ID as string;

// One fixed URL/zoom for every viewport — see docs/travel-feature.md#loading-placeholder
export const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?${new URLSearchParams(
  {
    center: `${mapCenter.lat},${mapCenter.lng}`,
    key: googleApiKey,
    map_id: googleMapsStaticMapId,
    scale: '2',
    size: `${MAP_STATIC_SIZE.width}x${MAP_STATIC_SIZE.height}`,
    zoom: '1',
  }
).toString()}`;
