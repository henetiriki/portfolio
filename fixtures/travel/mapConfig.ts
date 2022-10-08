import { gunmetal, mediumSeaGreen, paynesGrey, white } from '@styles/shared';

export const MAP_MAX_MOBILE = 768;

export const mapOptions = (): google.maps.MapOptions => ({
  center: {
    lat: 0.0,
    lng: 95.0,
  },
  mapTypeId: 'roadmap',
  restriction: {
    latLngBounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(-85, -180),
      new google.maps.LatLng(85, 180)
    ),
    strictBounds: true,
  },
  styles: [
    {
      elementType: 'geometry',
      featureType: 'water',
      stylers: [
        {
          color: paynesGrey,
        },
      ],
    },
    {
      elementType: 'geometry',
      featureType: 'landscape',
      stylers: [
        {
          color: mediumSeaGreen,
        },
      ],
    },
    {
      featureType: 'poi',
      stylers: [
        {
          color: mediumSeaGreen,
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
          color: mediumSeaGreen,
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
          color: mediumSeaGreen,
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
          color: mediumSeaGreen,
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
          color: white,
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
          color: mediumSeaGreen,
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
          color: gunmetal,
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
          color: mediumSeaGreen,
        },
      ],
    },
    {
      elementType: 'geometry.stroke',
      featureType: 'road',
      stylers: [
        {
          color: gunmetal,
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
