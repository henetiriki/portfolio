import { colorOverrides } from '@styles';
import type { MarkerIcon } from './types';

const {
  alizarin,
  ['all-ports']: allPorts,
  ['pine-green']: pineGreen,
  pumpkin,
  ['torch-red']: torchRed,
} = colorOverrides;

export const markerIconPath =
  'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';

export const previousCityIcon: MarkerIcon = {
  color: pumpkin[4],
  scale: 1,
};

export const currentCityIcon: MarkerIcon = {
  color: torchRed[4],
  scale: 1.25,
};

export const airportIcon: MarkerIcon = {
  color: pineGreen[4],
  scale: 0.85,
};

export const portIcon: MarkerIcon = {
  color: allPorts[4],
  scale: 0.85,
};

export const stationIcon: MarkerIcon = {
  color: alizarin[4],
  scale: 0.85,
};
