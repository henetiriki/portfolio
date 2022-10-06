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
  portCode: 'GBDVR',
  position: { lat: 51.12477, lng: 1.33287 },
  title: 'Port of Dover',
};

export const FRCQF: Port = {
  city: 'Calais',
  country: 'France',
  portCode: 'FRCQF',
  position: { lat: 50.96664, lng: 1.86851 },
  title: 'Port of Calais',
};

export const BCTSA: Port = {
  city: 'Vancouver',
  country: CANADA,
  portCode: 'BCTSA',
  position: { lat: 49.00727, lng: -123.12976 },
  title: 'Tsawwassen Ferry Terminal',
};

export const BCSWA: Port = {
  city: 'Swartz Bay',
  country: CANADA,
  portCode: 'BCSWA',
  position: { lat: 48.68817, lng: -123.41186 },
  title: 'Swartz Bay ferry terminal',
};

export const GBPME: Port = {
  city: 'Portsmouth',
  country: UK,
  portCode: 'GBPME',
  position: { lat: 50.79703, lng: -1.10926 },
  title: 'Port of Portsmouth',
};

export const GBRYD: Port = {
  city: 'Ryde',
  country: UK,
  portCode: 'GBRYD',
  position: { lat: 50.73935, lng: -1.16003 },
  title: 'Ryde Pier Head',
};

export const NZWLG: Port = {
  city: 'Wellington',
  country: NEW_ZEALAND,
  portCode: 'NZPCN',
  position: { lat: -41.27993, lng: 174.78171 },
  title: 'Port of Wellington',
};

export const NZPCN: Port = {
  city: 'Picton',
  country: NEW_ZEALAND,
  portCode: 'NZPCN',
  position: { lat: -41.2857, lng: 174.00511 },
  title: 'Port of Picton',
};

export const DKCPH: Port = {
  city: 'København',
  country: DENMARK,
  portCode: 'DKCPH',
  position: { lat: 55.702022, lng: 12.59593 },
  title: 'Port of Copenhagen',
};

export const NOOSL: Port = {
  city: 'Oslo',
  country: NORWAY,
  portCode: 'NOOSL',
  position: { lat: 59.902835, lng: 10.744473 },
  title: 'Port of Oslo',
};

export const NOSVJ: Port = {
  city: 'Svolvær',
  country: NORWAY,
  portCode: 'NOSVJ',
  position: { lat: 68.23079, lng: 14.566888 },
  title: 'Port of Svolvær',
};

export const NOTOS: Port = {
  city: 'Tromsø',
  country: NORWAY,
  portCode: 'NOTOS',
  position: { lat: 69.648689, lng: 18.963214 },
  title: 'Port of Tromsø',
};

export const NZAKL: Port = {
  city: 'Auckland',
  country: NEW_ZEALAND,
  portCode: 'NZAKL',
  position: { lat: -36.840985, lng: 174.765767 },
  title: 'Port of Auckland',
};

export const NCNOU: Port = {
  city: 'Nouméa',
  country: NEW_CALEDONIA,
  portCode: 'NCNOU',
  position: { lat: -22.271686, lng: 166.436775 },
  title: 'Port of Nouméa',
};

export const LIFOU: Port = {
  city: 'Lifou',
  country: NEW_CALEDONIA,
  portCode: 'LIFOU',
  position: { lat: -20.909169, lng: 167.277028 },
  title: 'Lifou Marina',
};

export const VUVLI: Port = {
  city: 'Port Vila',
  country: 'Vanuatu',
  portCode: 'VUVLI',
  position: { lat: -17.756154, lng: 168.29983 },
  title: 'Port of Port Vila',
};

export const NCMEE: Port = {
  city: 'Mare',
  country: NEW_CALEDONIA,
  portCode: 'NCMEE',
  position: { lat: -21.549376, lng: 167.862849 },
  title: 'Mare Anchor Point',
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
