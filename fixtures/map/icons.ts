import {
  alizarin,
  blueViolet,
  deepMagenta,
  flameRed,
  tahitiGold,
} from '@styles/shared';

const SHARE_ICON_PROPS: google.maps.Symbol = {
  fillOpacity: 0.95,
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  strokeWeight: 0,
};

export const PREVIOUS_CITY_ICON: google.maps.Symbol = {
  ...SHARE_ICON_PROPS,
  fillColor: deepMagenta,
  scale: 1,
};

export const CURRENT_CITY_ICON: google.maps.Symbol = {
  ...SHARE_ICON_PROPS,
  fillColor: blueViolet,
  scale: 1.5,
};

export const AIRPORT_ICON: google.maps.Symbol = {
  ...SHARE_ICON_PROPS,
  fillColor: tahitiGold,
  scale: 0.85,
};

export const PORT_ICON: google.maps.Symbol = {
  ...SHARE_ICON_PROPS,
  fillColor: flameRed,
  scale: 0.85,
};

export const STATION_ICON: google.maps.Symbol = {
  ...SHARE_ICON_PROPS,
  fillColor: alizarin,
  scale: 0.85,
};
