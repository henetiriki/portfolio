import { colorOverrides } from '@styles';
import type { MarkerIcon } from './types';

const {
  alizarin,
  ['all-ports']: allPorts,
  ['pine-green']: pineGreen,
  pumpkin,
  ['torch-red']: torchRed,
} = colorOverrides;

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
