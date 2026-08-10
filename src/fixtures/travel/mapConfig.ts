export const MAP_MAX_MOBILE = 768;
export const STROKE_WEIGHT_DEFAULT = 1.25;

const googleMapsMapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID as string;

export const mapOptions = (): google.maps.MapOptions => ({
  center: {
    lat: 0.0,
    lng: 32.0,
  },
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
