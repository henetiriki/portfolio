import { AIRPORT_ICON, PORT_ICON, STATION_ICON } from './icons';

const SHARED_MARKER_OPTIONS: google.maps.MarkerOptions = {
  draggable: false,
  optimized: false,
  zIndex: 100,
};

export const AIRPORT_MARKER_OPTIONS: google.maps.MarkerOptions = {
  ...SHARED_MARKER_OPTIONS,
  icon: AIRPORT_ICON,
};

export const CITY_MARKER_OPTIONS: google.maps.MarkerOptions = {
  ...SHARED_MARKER_OPTIONS,
};

export const PORT_MARKER_OPTIONS: google.maps.MarkerOptions = {
  ...SHARED_MARKER_OPTIONS,
  icon: PORT_ICON,
};

export const STATION_MARKER_OPTIONS: google.maps.MarkerOptions = {
  ...SHARED_MARKER_OPTIONS,
  icon: STATION_ICON,
};
