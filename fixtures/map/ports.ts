import {
  CANADA,
  DENMARK,
  NEW_CALEDONIA,
  NEW_ZEALAND,
  NORWAY,
  UK,
} from './countries';
import { Port } from './types';

export const GBDVR: Port = {
  city: 'Dover',
  country: UK,
  loc: { lat: 51.12477, lng: 1.33287 },
  name: 'Port of Dover',
  portCode: 'GBDVR',
};

export const FRCQF: Port = {
  city: 'Calais',
  country: 'France',
  loc: { lat: 50.96664, lng: 1.86851 },
  name: 'Port of Calais',
  portCode: 'FRCQF',
};

export const BCTSA: Port = {
  city: 'Vancouver',
  country: CANADA,
  loc: { lat: 49.00727, lng: -123.12976 },
  name: 'Tsawwassen Ferry Terminal',
  portCode: 'BCTSA',
};

export const BCSWA: Port = {
  city: 'Swartz Bay',
  country: CANADA,
  loc: { lat: 48.68817, lng: -123.41186 },
  name: 'Swartz Bay ferry terminal',
  portCode: 'BCSWA',
};

export const GBPME: Port = {
  city: 'Portsmouth',
  country: UK,
  loc: { lat: 50.79703, lng: -1.10926 },
  name: 'Port of Portsmouth',
  portCode: 'GBPME',
};

export const GBRYD: Port = {
  city: 'Ryde',
  country: UK,
  loc: { lat: 50.73935, lng: -1.16003 },
  name: 'Ryde Pier Head',
  portCode: 'GBRYD',
};

export const NZWLG: Port = {
  city: 'Wellington',
  country: NEW_ZEALAND,
  loc: { lat: -41.27993, lng: 174.78171 },
  name: 'Port of Wellington',
  portCode: 'NZPCN',
};

export const NZPCN: Port = {
  city: 'Picton',
  country: NEW_ZEALAND,
  loc: { lat: -41.2857, lng: 174.00511 },
  name: 'Port of Picton',
  portCode: 'NZPCN',
};

export const DKCPH: Port = {
  city: 'København',
  country: DENMARK,
  loc: { lat: 55.702022, lng: 12.59593 },
  name: 'Port of Copenhagen',
  portCode: 'DKCPH',
};

export const NOOSL: Port = {
  city: 'Oslo',
  country: NORWAY,
  loc: { lat: 59.902835, lng: 10.744473 },
  name: 'Port of Oslo',
  portCode: 'NOOSL',
};

export const NOSVJ: Port = {
  city: 'Svolvær',
  country: NORWAY,
  loc: { lat: 68.23079, lng: 14.566888 },
  name: 'Port of Svolvær',
  portCode: 'NOSVJ',
};

export const NOTOS: Port = {
  city: 'Tromsø',
  country: NORWAY,
  loc: { lat: 69.648689, lng: 18.963214 },
  name: 'Port of Tromsø',
  portCode: 'NOTOS',
};

export const NZAKL: Port = {
  city: 'Auckland',
  country: NEW_ZEALAND,
  loc: { lat: -36.840985, lng: 174.765767 },
  name: 'Port of Auckland',
  portCode: 'NZAKL',
};

export const NCNOU: Port = {
  city: 'Nouméa',
  country: NEW_CALEDONIA,
  loc: { lat: -22.271686, lng: 166.436775 },
  name: 'Port of Nouméa',
  portCode: 'NCNOU',
};

export const LIFOU: Port = {
  city: 'Lifou',
  country: NEW_CALEDONIA,
  loc: { lat: -20.909169, lng: 167.277028 },
  name: 'Lifou Marina',
  portCode: 'LIFOU',
};

export const VUVLI: Port = {
  city: 'Port Vila',
  country: 'Vanuatu',
  loc: { lat: -17.756154, lng: 168.29983 },
  name: 'Port of Port Vila',
  portCode: 'VUVLI',
};

export const NCMEE: Port = {
  city: 'Mare',
  country: NEW_CALEDONIA,
  loc: { lat: -21.549376, lng: 167.862849 },
  name: 'Mare Anchor Point',
  portCode: 'NCMEE',
};

export const PORTS: Port[] = [
  BCTSA,
  BCSWA,
  DKCPH,
  FRCQF,
  GBDVR,
  GBPME,
  GBRYD,
  LIFOU,
  NCMEE,
  NCNOU,
  NOOSL,
  NOSVJ,
  NOTOS,
  NZAKL,
  NZPCN,
  NZWLG,
  VUVLI,
];
