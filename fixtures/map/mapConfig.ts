import { START_POINT } from './points';

export const mapOptions: google.maps.MapOptions = {
  center: START_POINT,
  mapTypeId: 'roadmap',
  minZoom: 2,
  scrollwheel: false,
  styles: [
    {
      elementType: 'geometry',
      featureType: 'water',
      stylers: [
        {
          color: '#3b3d53',
        },
      ],
    },
    {
      elementType: 'geometry',
      featureType: 'landscape',
      stylers: [
        {
          color: '#2ecc71',
        },
      ],
    },
    {
      featureType: 'poi',
      stylers: [
        {
          color: '#2ecc71',
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
          color: '#2ecc71',
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
          color: '#2ecc71',
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
          color: '#2ecc71',
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
          color: '#ffffff',
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
          color: '#2ecc71',
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
          color: '#333739',
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
          color: '#2ecc71',
        },
      ],
    },
    {
      elementType: 'geometry.stroke',
      featureType: 'road',
      stylers: [
        {
          color: '#333739',
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
  zoom: 2,
};
