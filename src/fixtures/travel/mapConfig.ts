export const MAP_MAX_MOBILE = 768;
export const STROKE_WEIGHT_DEFAULT = 1.25;
export const MAP_STATIC_SIZE = { height: 400, width: 640 };

const mapCenter: google.maps.LatLngLiteral = { lat: 0.0, lng: 32.0 };

export const STATIC_MAP_CENTER = `${mapCenter.lat},${mapCenter.lng}`;

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

// Proxied through /api/static-map so the Maps API key stays server-side —
// see docs/travel-feature.md#loading-placeholder and D-260825c
export const staticMapUrl = '/api/static-map';
