import { NEW_ZEALAND, SOUTH_AFRICA, UK } from './countries';
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
const prevIcon: google.maps.Symbol = {
  fillColor: '#e22734',
  fillOpacity: 0.95,
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  scale: 2,
  strokeColor: '#fff',
  strokeWeight: 3,
};

const curIcon: google.maps.Symbol = {
  fillColor: '#e25a00',
  fillOpacity: 0.95,
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  scale: 3,
  strokeColor: '#fff',
  strokeWeight: 3,
};

const HARTSWATER: City = {
  description: 'I was born here...',
  icon: prevIcon,
  loc: HARTSWATER_POINT,
  name: `Hartswater, ${SOUTH_AFRICA}`,
};

const HEIDELBERG: City = {
  description: 'I grew up here...',
  icon: prevIcon,
  loc: HEIDELBERG_POINT,
  name: `Heidelberg, ${SOUTH_AFRICA}`,
};

const VRYBURG: City = {
  description: 'I went to High School here...',
  icon: prevIcon,
  loc: VRYBURG_POINT,
  name: `Vryburg, ${SOUTH_AFRICA}`,
};

const LONDON: City = {
  description: lived,
  icon: prevIcon,
  loc: LONDON_POINT,
  name: `London, ${UK}`,
};

const JOHANNESBURG: City = {
  description: lived,
  icon: prevIcon,
  loc: BENONI_POINT,
  name: `Johannesburg, ${SOUTH_AFRICA}`,
};

const CAPE_TOWN: City = {
  description: 'I moved to NZ from here...',
  icon: prevIcon,
  loc: CAPE_TOWN_POINT,
  name: `Cape Town, ${SOUTH_AFRICA}`,
};

const HAMILTON: City = {
  description: lived,
  icon: prevIcon,
  loc: HAMILTON_POINT,
  name: `Hamilton, ${NEW_ZEALAND}`,
};

const AUCKLAND: City = {
  description: lived,
  icon: prevIcon,
  loc: AUCKLAND_POINT,
  name: `Auckland, ${NEW_ZEALAND}`,
};

const SILVERSTREAM: City = {
  current: true,
  description: 'I currently live in this area...',
  icon: curIcon,
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
