import { NEW_ZEALAND, SOUTH_AFRICA, UK } from './countries';
import { CURRENT_CITY_ICON, PREVIOUS_CITY_ICON } from './icons';
import {
  AUCKLAND_POINT,
  BENONI_POINT,
  CAPE_TOWN_POINT,
  HAMILTON_POINT,
  HARTSWATER_POINT,
  HEIDELBERG_POINT,
  LONDON_POINT,
  SILVERSTREAM_POINT,
  VRYBURG_POINT,
} from './points';
import { City } from './types';

const lived = "I've lived here...";

const HARTSWATER: City = {
  description: 'I was born here...',
  icon: PREVIOUS_CITY_ICON,
  loc: HARTSWATER_POINT,
  name: `Hartswater, ${SOUTH_AFRICA}`,
};

const HEIDELBERG: City = {
  description: 'I grew up here...',
  icon: PREVIOUS_CITY_ICON,
  loc: HEIDELBERG_POINT,
  name: `Heidelberg, ${SOUTH_AFRICA}`,
};

const VRYBURG: City = {
  description: 'I went to High School here...',
  icon: PREVIOUS_CITY_ICON,
  loc: VRYBURG_POINT,
  name: `Vryburg, ${SOUTH_AFRICA}`,
};

const LONDON: City = {
  description: lived,
  icon: PREVIOUS_CITY_ICON,
  loc: LONDON_POINT,
  name: `London, ${UK}`,
};

const JOHANNESBURG: City = {
  description: lived,
  icon: PREVIOUS_CITY_ICON,
  loc: BENONI_POINT,
  name: `Johannesburg, ${SOUTH_AFRICA}`,
};

const CAPE_TOWN: City = {
  description: 'I moved to NZ from here...',
  icon: PREVIOUS_CITY_ICON,
  loc: CAPE_TOWN_POINT,
  name: `Cape Town, ${SOUTH_AFRICA}`,
};

const HAMILTON: City = {
  description: lived,
  icon: PREVIOUS_CITY_ICON,
  loc: HAMILTON_POINT,
  name: `Hamilton, ${NEW_ZEALAND}`,
};

const AUCKLAND: City = {
  description: lived,
  icon: PREVIOUS_CITY_ICON,
  loc: AUCKLAND_POINT,
  name: `Auckland, ${NEW_ZEALAND}`,
};

const SILVERSTREAM: City = {
  current: true,
  description: 'I currently live in this area...',
  icon: CURRENT_CITY_ICON,
  loc: SILVERSTREAM_POINT,
  name: `Silverstream, Wellington, ${NEW_ZEALAND}`,
};

export const CITIES: City[] = [
  HARTSWATER,
  HEIDELBERG,
  VRYBURG,
  LONDON,
  JOHANNESBURG,
  CAPE_TOWN,
  HAMILTON,
  AUCKLAND,
  SILVERSTREAM,
];
