import {
  alizarin,
  blueViolet,
  deepMagenta,
  flameRed,
  tahitiGold,
} from '@styles/shared';

const sharedIconProps: google.maps.Symbol = {
  fillOpacity: 0.95,
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  strokeWeight: 0,
};

export const previousCityIcon: google.maps.Symbol = {
  ...sharedIconProps,
  fillColor: deepMagenta,
  scale: 1,
};

export const currentCityIcon: google.maps.Symbol = {
  ...sharedIconProps,
  fillColor: blueViolet,
  scale: 1.5,
};

export const airportIcon: google.maps.Symbol = {
  ...sharedIconProps,
  fillColor: tahitiGold,
  scale: 0.85,
};

export const portIcon: google.maps.Symbol = {
  ...sharedIconProps,
  fillColor: flameRed,
  scale: 0.85,
};

export const stationIcon: google.maps.Symbol = {
  ...sharedIconProps,
  fillColor: alizarin,
  scale: 0.85,
};
