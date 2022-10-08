import {
  canada,
  denmark,
  newCaledonia,
  newZealand,
  norway,
  unitedKingdom,
} from './countries';
import { Location } from './types';

export const GBDVR: Location = {
  description: `Dover, ${unitedKingdom}`,
  position: { lat: 51.12477, lng: 1.33287 },
  title: 'GBDVR // Port of Dover',
};

export const FRCQF: Location = {
  description: 'Calais, France',
  position: { lat: 50.96664, lng: 1.86851 },
  title: 'FRCQF // Port of Calais',
};

export const BCTSA: Location = {
  description: `Vancouver, ${canada}`,
  position: { lat: 49.00727, lng: -123.12976 },
  title: 'BCTSA // Tsawwassen Ferry Terminal',
};

export const BCSWA: Location = {
  description: `Swartz Bay, ${canada}`,
  position: { lat: 48.68817, lng: -123.41186 },
  title: 'BCSWA // Swartz Bay ferry terminal',
};

export const GBPME: Location = {
  description: `Portsmouth, ${unitedKingdom}`,
  position: { lat: 50.79703, lng: -1.10926 },
  title: 'GBPME // Port of Portsmouth',
};

export const GBRYD: Location = {
  description: `Ryde, ${unitedKingdom}`,
  position: { lat: 50.73935, lng: -1.16003 },
  title: 'GBRYD // Ryde Pier Head',
};

export const NZWLG: Location = {
  description: `Wellington, ${newZealand}`,
  position: { lat: -41.27993, lng: 174.78171 },
  title: 'NZPCN // Port of Wellington',
};

export const NZPCN: Location = {
  description: `Picton, ${newZealand}`,
  position: { lat: -41.2857, lng: 174.00511 },
  title: 'NZPCN // Port of Picton',
};

export const DKCPH: Location = {
  description: `København, ${denmark}`,
  position: { lat: 55.702022, lng: 12.59593 },
  title: 'DKCPH // Port of Copenhagen',
};

export const NOOSL: Location = {
  description: `Oslo, ${norway}`,
  position: { lat: 59.902835, lng: 10.744473 },
  title: 'NOOSL // Port of Oslo',
};

export const NOSVJ: Location = {
  description: `Svolvær, ${norway}`,
  position: { lat: 68.23079, lng: 14.566888 },
  title: 'NOSVJ // Port of Svolvær',
};

export const NOTOS: Location = {
  description: `Tromsø, ${norway}`,
  position: { lat: 69.648689, lng: 18.963214 },
  title: 'NOTOS // Port of Tromsø',
};

export const NZAKL: Location = {
  description: `Auckland, ${newZealand}`,
  position: { lat: -36.840985, lng: 174.765767 },
  title: 'NZAKL // Port of Auckland',
};

export const NCNOU: Location = {
  description: `Nouméa, ${newCaledonia}`,
  position: { lat: -22.271686, lng: 166.436775 },
  title: 'NCNOU // Port of Nouméa',
};

export const LIFOU: Location = {
  description: `Lifou, ${newCaledonia}`,
  position: { lat: -20.909169, lng: 167.277028 },
  title: 'LIFOU // Lifou Marina',
};

export const VUVLI: Location = {
  description: 'Port Vila, Vanuatu',
  position: { lat: -17.756154, lng: 168.29983 },
  title: 'VUVLI // Port of Port Vila',
};

export const NCMEE: Location = {
  description: `Mare, ${newCaledonia}`,
  position: { lat: -21.549376, lng: 167.862849 },
  title: 'NCMEE // Mare Anchor Point',
};

export const ports: Location[] = [
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
