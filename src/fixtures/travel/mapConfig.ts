import { colorOverrides } from '@styles/shared';

export const MAP_MAX_MOBILE = 768;
export const STROKE_WEIGHT_DEFAULT = 1.25;

const { gunmetal, mediumSeaGreen, paynesGrey, whisper } = colorOverrides;

export const mapOptions = (): google.maps.MapOptions => ({
  center: {
    lat: 0.0,
    lng: 32.0,
  },
  mapTypeId: 'roadmap',
  restriction: {
    latLngBounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(-85, -180),
      new google.maps.LatLng(85, 180)
    ),
    strictBounds: true,
  },
  scrollwheel: false,
  styles: [
    {
      elementType: 'geometry',
      featureType: 'water',
      stylers: [
        {
          color: paynesGrey[4],
        },
      ],
    },
    {
      elementType: 'geometry',
      featureType: 'landscape',
      stylers: [
        {
          color: mediumSeaGreen[4],
        },
      ],
    },
    {
      featureType: 'poi',
      stylers: [
        {
          color: mediumSeaGreen[4],
        },
        {
          lightness: -7,
        },
      ],
    },
    {
      elementType: 'geometry',
      featureType: 'road.highway',
      stylers: [
        {
          color: mediumSeaGreen[4],
        },
        {
          lightness: -28,
        },
      ],
    },
    {
      elementType: 'geometry',
      featureType: 'road.arterial',
      stylers: [
        {
          color: mediumSeaGreen[4],
        },
        {
          visibility: 'on',
        },
        {
          lightness: -15,
        },
      ],
    },
    {
      elementType: 'geometry',
      featureType: 'road.local',
      stylers: [
        {
          color: mediumSeaGreen[4],
        },
        {
          lightness: -18,
        },
      ],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: whisper[0],
        },
      ],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      elementType: 'geometry',
      featureType: 'transit',
      stylers: [
        {
          color: mediumSeaGreen[4],
        },
        {
          lightness: -34,
        },
      ],
    },
    {
      elementType: 'geometry',
      featureType: 'administrative',
      stylers: [
        {
          visibility: 'on',
        },
        {
          color: gunmetal[4],
        },
        {
          weight: 0.8,
        },
      ],
    },
    {
      featureType: 'poi.park',
      stylers: [
        {
          color: mediumSeaGreen[4],
        },
      ],
    },
    {
      elementType: 'geometry.stroke',
      featureType: 'road',
      stylers: [
        {
          color: gunmetal[4],
        },
        {
          weight: 0.3,
        },
        {
          lightness: 10,
        },
      ],
    },
  ],
});
