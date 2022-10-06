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
  position: HARTSWATER_POINT,
  title: `Hartswater, ${SOUTH_AFRICA}`,
};

const HEIDELBERG: City = {
  description: 'I grew up here...',
  icon: PREVIOUS_CITY_ICON,
  position: HEIDELBERG_POINT,
  title: `Heidelberg, ${SOUTH_AFRICA}`,
};

const VRYBURG: City = {
  description: 'I went to High School here...',
  icon: PREVIOUS_CITY_ICON,
  position: VRYBURG_POINT,
  title: `Vryburg, ${SOUTH_AFRICA}`,
};

const LONDON: City = {
  description: lived,
  icon: PREVIOUS_CITY_ICON,
  position: LONDON_POINT,
  title: `London, ${UK}`,
};

const JOHANNESBURG: City = {
  description: lived,
  icon: PREVIOUS_CITY_ICON,
  position: BENONI_POINT,
  title: `Johannesburg, ${SOUTH_AFRICA}`,
};

const CAPE_TOWN: City = {
  description: 'I moved to NZ from here...',
  icon: PREVIOUS_CITY_ICON,
  position: CAPE_TOWN_POINT,
  title: `Cape Town, ${SOUTH_AFRICA}`,
};

const HAMILTON: City = {
  description: lived,
  icon: PREVIOUS_CITY_ICON,
  position: HAMILTON_POINT,
  title: `Hamilton, ${NEW_ZEALAND}`,
};

const AUCKLAND: City = {
  description: lived,
  icon: PREVIOUS_CITY_ICON,
  position: AUCKLAND_POINT,
  title: `Auckland, ${NEW_ZEALAND}`,
};

const SILVERSTREAM: City = {
  current: true,
  description: 'I currently live in this area...',
  icon: CURRENT_CITY_ICON,
  position: SILVERSTREAM_POINT,
  title: `Silverstream, Wellington, ${NEW_ZEALAND}`,
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
