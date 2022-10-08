import {
  denmark,
  newZealand,
  norway,
  scotland,
  sweden,
  switzerland,
  unitedKingdom,
} from './countries';
import { Location } from './types';

export const MYB: Location = {
  description: `London, ${unitedKingdom}`,
  position: { lat: 51.522617, lng: -0.162974 },
  title: 'MYB // London Marylebone',
};

export const AYS: Location = {
  description: `Aylesbury, ${unitedKingdom}`,
  position: { lat: 51.813675, lng: -0.814787 },
  title: 'AYS // Aylesbury Station',
};

export const KGX: Location = {
  description: `London, ${unitedKingdom}`,
  position: { lat: 51.531433, lng: -0.12424 },
  title: `KGX // London King's Cross`,
};

export const EDB: Location = {
  description: `Edinburgh, ${scotland}`,
  position: { lat: 55.951842, lng: -3.190356 },
  title: 'EDB // Edinburgh Waverley',
};

export const VIC: Location = {
  description: `London, ${unitedKingdom}`,
  position: { lat: 51.4952111, lng: -0.1440114 },
  title: 'VIC // London Victoria',
};

export const BTN: Location = {
  description: `Brighton, ${unitedKingdom}`,
  position: { lat: 50.829485, lng: -0.141036 },
  title: 'BTN // Brighton Station',
};

export const EBN: Location = {
  description: `Eastbourne, ${unitedKingdom}`,
  position: { lat: 50.769411, lng: 0.281219 },
  title: 'EBN // Eastbourne Station',
};

export const HGS: Location = {
  description: `Hastings, ${unitedKingdom}`,
  position: { lat: 50.858226, lng: 0.577018 },
  title: 'HGS // Hastings Station',
};

export const CST: Location = {
  description: `London, ${unitedKingdom}`,
  position: { lat: 51.511275, lng: -0.090282 },
  title: 'CST // London Cannon Street',
};

export const BAN: Location = {
  description: `Banbury, ${unitedKingdom}`,
  position: { lat: 52.060644, lng: -1.327897 },
  title: 'BAN // Banbury Station',
};

export const WAT: Location = {
  description: `London, ${unitedKingdom}`,
  position: { lat: 51.503106, lng: -0.11239 },
  title: 'WAT // London Waterloo',
};

export const GLD: Location = {
  description: `Guildford, ${unitedKingdom}`,
  position: { lat: 51.236765, lng: -0.580707 },
  title: 'GLD // Guildford Station',
};

export const PAD: Location = {
  description: `London, ${unitedKingdom}`,
  position: { lat: 51.516609, lng: -0.176839 },
  title: 'PAD // London Paddington',
};

export const WNR: Location = {
  description: `Windsor, ${unitedKingdom}`,
  position: { lat: 51.485719, lng: -0.606355 },
  title: 'WNR // Windsor and Eton Riverside Station',
};

export const RDG: Location = {
  description: `Reading, ${unitedKingdom}`,
  position: { lat: 51.459205, lng: -0.972766 },
  title: 'RDG // Reading Station',
};

export const BCE: Location = {
  description: `Bracknell, ${unitedKingdom}`,
  position: { lat: 51.413027, lng: -0.752136 },
  title: 'BCE // Bracknell Station',
};

export const PME: Location = {
  description: `Portsmouth, ${unitedKingdom}`,
  position: { lat: 50.796958, lng: -1.107896 },
  title: 'PME // Portsmouth Harbour Station Pier',
};

export const ZHB: Location = {
  description: `Zürich, ${switzerland}`,
  position: { lat: 47.378375, lng: 8.538908 },
  title: 'ZHB // Zürich Hauptbahnhof',
};

export const BHB: Location = {
  description: `Bern, ${switzerland}`,
  position: { lat: 46.948348, lng: 7.436341 },
  title: 'BHB // Bahnhof Bern',
};

export const GDB: Location = {
  description: `Grindelwald, ${switzerland}`,
  position: { lat: 46.624451, lng: 8.033323 },
  title: 'GDB // Bahnhof Grindelwald',
};

export const CHB: Location = {
  description: `Chiasso, ${switzerland}`,
  position: { lat: 45.83183, lng: 9.031275 },
  title: 'CHB // Stazione di Chiasso',
};

export const WEL: Location = {
  description: `Wellington, ${newZealand}`,
  position: { lat: -41.279217, lng: 174.780331 },
  title: 'WELL // Wellington Station',
};

export const HAM: Location = {
  description: `Hamilton, ${newZealand}`,
  position: { lat: -37.790919, lng: 175.26501 },
  title: 'HAM // Hamilton Station',
};

export const CHC: Location = {
  description: `Christchurch, ${newZealand}`,
  position: { lat: -43.539931, lng: 172.607988 },
  title: 'CHCH // Christchurch Station',
};

export const PIC: Location = {
  description: `Picton, ${newZealand}`,
  position: { lat: -41.288347, lng: 174.004794 },
  title: 'PICT // Picton Station',
};

export const XEV: Location = {
  description: `Stockholm, ${sweden}`,
  position: { lat: 59.330616, lng: 18.056583 },
  title: 'XEV // Stockholm Central Station',
};

export const ZGH: Location = {
  description: `Copenhagen, ${denmark}`,
  position: { lat: 55.672667, lng: 12.564894 },
  title: 'ZGH / Copenhagen Central Station',
};

export const XZO: Location = {
  description: `Oslo, ${norway}`,
  position: { lat: 59.910146, lng: 10.755197 },
  title: 'XZO // Oslo Central Station',
};

export const QFV: Location = {
  description: `Bergen, ${norway}`,
  position: { lat: 60.390254, lng: 5.333838 },
  title: 'QFV // Bergen Railway Station',
};

export const XZT: Location = {
  description: `Trondheim, ${norway}`,
  position: { lat: 63.436651, lng: 10.398618 },
  title: 'XZT // Trondheim Central Station',
};

export const BOO: Location = {
  description: `Bodø, ${norway}`,
  position: { lat: 67.286444, lng: 14.391597 },
  title: 'BOO // Bodø Station',
};

export const stations: Location[] = [
  MYB,
  AYS,
  KGX,
  EDB,
  VIC,
  BTN,
  EBN,
  HGS,
  CST,
  BAN,
  WAT,
  GLD,
  PAD,
  WNR,
  RDG,
  BCE,
  PME,
  ZHB,
  BHB,
  GDB,
  CHB,
  WEL,
  HAM,
  CHC,
  PIC,
  XEV,
  ZGH,
  XZO,
  QFV,
  XZT,
  BOO,
];
