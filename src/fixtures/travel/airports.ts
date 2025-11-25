import {
  australia,
  canada,
  china,
  germany,
  hongKong,
  japan,
  newZealand,
  norway,
  southAfrica,
  sweden,
  thailand,
  unitedKingdom,
  unitedStates,
  zambia,
  zimbabwe,
} from './countries';
import type { Location } from './types';

export const JNB: Location = {
  description: `Johannesburg, ${southAfrica}`,
  position: { lat: -26.136837, lng: 28.241157 },
  title: 'JNB // OR Tambo International',
};

export const CPT: Location = {
  description: `Cape Town, ${southAfrica}`,
  position: { lat: -33.971459, lng: 18.602241 },
  title: 'CPT // Cape Town International',
};

export const MBD: Location = {
  description: `Mafikeng, ${southAfrica}`,
  position: { lat: -25.807261, lng: 25.544465 },
  title: 'MBD // Mafikeng International',
};

export const DUR: Location = {
  description: `Durban, ${southAfrica}`,
  position: { lat: -29.967507, lng: 30.947187 },
  title: 'DUR // Durban International',
};

export const KIM: Location = {
  description: `Kimberley, ${southAfrica}`,
  position: { lat: -28.802682, lng: 24.765399 },
  title: 'KIM // Kimberley',
};

export const BFN: Location = {
  description: `Bloemfontein, ${southAfrica}`,
  position: { lat: -29.095735, lng: 26.298145 },
  title: 'BFN // Bram Fischer International',
};

export const PLZ: Location = {
  description: `Port Elizabeth, ${southAfrica}`,
  position: { lat: -33.986448, lng: 25.61039 },
  title: 'PLZ // Port Elizabeth',
};

export const ELS: Location = {
  description: `East London, ${southAfrica}`,
  position: { lat: -33.038191, lng: 27.828955 },
  title: 'ELS // East London',
};

export const GRJ: Location = {
  description: `George, ${southAfrica}`,
  position: { lat: -34.005193, lng: 22.378423 },
  title: 'GRJ // George',
};

export const MPM: Location = {
  description: 'Maputo, Mozambique',
  position: { lat: -25.919804, lng: 32.572997 },
  title: 'MPM // Maputo International',
};

export const GBE: Location = {
  description: 'Gaborone, Botswana',
  position: { lat: -24.555994, lng: 25.918776 },
  title: 'GBE // Sir Seretse Khama International',
};

export const WDH: Location = {
  description: 'Windhoek, Namibia',
  position: { lat: -22.480292, lng: 17.470903 },
  title: 'WDH // Hosea Kutako International',
};

export const BUQ: Location = {
  description: `Bulawayo, ${zimbabwe}`,
  position: { lat: -20.018368, lng: 28.624652 },
  title: 'BUQ // Joshua Mqabuko Nkomo International',
};

export const HRE: Location = {
  description: `Harare, ${zimbabwe}`,
  position: { lat: -17.918871, lng: 31.097359 },
  title: 'HRE // Harare International',
};

export const LVI: Location = {
  description: `Livingstone , ${zambia}`,
  position: { lat: -17.818925, lng: 25.818595 },
  title: 'LVI // Harry Mwanga Nkumbula International',
};

export const LUN: Location = {
  description: `Lusaka, ${zambia}`,
  position: { lat: -15.330899, lng: 28.454393 },
  title: 'LUN // Kenneth Kaunda International',
};

export const LAD: Location = {
  description: 'Luanda, Angola',
  position: { lat: -8.848009, lng: 13.2349 },
  title: 'LAD // Quatro de Fevereiro',
};

export const DAR: Location = {
  description: 'Dar es Salaam, Tanzania',
  position: { lat: -6.872619, lng: 39.206986 },
  title: 'DAR // Julius Nyerere International',
};

export const EBB: Location = {
  description: 'Entebbe, Uganda',
  position: { lat: 0.044929, lng: 32.44288 },
  title: 'EBB // Entebbe International',
};

export const NBO: Location = {
  description: 'Nairobi, Kenya',
  position: { lat: -1.322705, lng: 36.926611 },
  title: 'NBO // Jomo Kenyatta International',
};

export const FIH: Location = {
  description: 'Kinshasa, Congo (DRC)',
  position: { lat: -4.385679, lng: 15.444503 },
  title: `FIH // N'djili International`,
};

export const LOS: Location = {
  description: 'Lagos, Nigeria',
  position: { lat: 6.581759, lng: 3.321484 },
  title: 'LOS // Murtala Muhammed International',
};

export const ABJ: Location = {
  description: `Abidjan, ${"Côte d'Ivoire"}`,
  position: { lat: 5.254863, lng: -3.93287 },
  title: 'ABJ // Felix Houphouet Boigny',
};

export const ACC: Location = {
  description: 'Accra, Ghana',
  position: { lat: 5.606068, lng: -0.168107 },
  title: 'ACC // Kotoka International',
};

export const DKR: Location = {
  description: 'Dakar, Senegal',
  position: { lat: 14.744887, lng: -17.490146 },
  title: 'DKR // Léopold Sédar Senghor International',
};

export const SID: Location = {
  description: 'Ilha do Sal, Cape Verde',
  position: { lat: 16.734608, lng: -22.943608 },
  title: 'SID // Amilcar Cabral International',
};

export const MRU: Location = {
  description: 'Plaine Magnien, Mauritius',
  position: { lat: -20.430714, lng: 57.675511 },
  title: 'MRU // Sir Seewoosagur Ramgoolam',
};

export const GRU: Location = {
  description: 'São Paulo, Brazil',
  position: { lat: -23.434617, lng: -46.478013 },
  title: 'GRU // Guarulhos International',
};

export const EZE: Location = {
  description: 'Beunos Aires, Argentina',
  position: { lat: -34.822544, lng: -58.534969 },
  title: 'EZE // Ministro Pistarini International',
};

export const MIA: Location = {
  description: `Miami, ${unitedStates}`,
  position: { lat: 25.795947, lng: -80.286611 },
  title: 'MIA // Miami International',
};

export const ATL: Location = {
  description: `Atlanta, ${unitedStates}`,
  position: { lat: 33.640795, lng: -84.427223 },
  title: 'ATL // Hartsfield–Jackson Atlanta International',
};

export const IAD: Location = {
  description: `Washington, ${unitedStates}`,
  position: { lat: 38.952765, lng: -77.451732 },
  title: 'IAD // Washington Dulles International',
};

export const JFK: Location = {
  description: `New York, ${unitedStates}`,
  position: { lat: 40.641242, lng: -73.777941 },
  title: 'JFK // John F. Kennedy International',
};

export const LGA: Location = {
  description: `New York, ${unitedStates}`,
  position: { lat: 40.776992, lng: -73.873376 },
  title: 'LGA // LaGuardia',
};

export const YVR: Location = {
  description: `Vancouver, ${canada}`,
  position: { lat: 49.196659, lng: -123.181056 },
  title: 'YVR // Vancouver International',
};

export const LHR: Location = {
  description: `London, ${unitedKingdom}`,
  position: { lat: 51.469979, lng: -0.454044 },
  title: 'LHR // London Heathrow',
};

export const FRA: Location = {
  description: `Frankfurt, ${germany}`,
  position: { lat: 50.037936, lng: 8.562608 },
  title: 'FRA // Frankfurt',
};

export const ZRH: Location = {
  description: 'Zurich, Switzerland',
  position: { lat: 47.458256, lng: 8.555717 },
  title: 'ZRH // Zurich',
};

export const CDG: Location = {
  description: 'Paris, France',
  position: { lat: 49.009702, lng: 2.548251 },
  title: 'CDG // Charles de Gaulle',
};

export const CPH: Location = {
  description: 'Copenhagen, Denmark',
  position: { lat: 55.618039, lng: 12.651198 },
  title: 'CPH // Copenhagen',
};

export const AMS: Location = {
  description: 'Amsterdam, Netherlands',
  position: { lat: 52.310523, lng: 4.76874 },
  title: 'AMS // Amsterdam Airport Schiphol',
};

export const BOM: Location = {
  description: 'Mumbai, India',
  position: { lat: 19.090121, lng: 72.868905 },
  title: 'BOM // Chhatrapati Shivaji International',
};

export const BKK: Location = {
  description: `Bangkok, ${thailand}`,
  position: { lat: 13.913019, lng: 100.604164 },
  title: 'BKK // Donmuang (old)',
};

export const BKKN: Location = {
  description: `Bangkok, ${thailand}`,
  position: { lat: 13.689084, lng: 100.751023 },
  title: 'BKK // Suvarnabhumi',
};

export const KIX: Location = {
  description: `Osaka, ${japan}`,
  position: { lat: 34.432015, lng: 135.230817 },
  title: 'KIX // Kansai International',
};

export const USM: Location = {
  description: `Koh Samui, ${thailand}`,
  position: { lat: 9.548389, lng: 100.063484 },
  title: 'USM // Koh Samui',
};

export const HKG: Location = {
  description: `${hongKong}, ${hongKong}`,
  position: { lat: 22.324767, lng: 114.19859 },
  title: 'HKG // Kai Tak (old)',
};

export const HKGN: Location = {
  description: `Chek Lap Kok, ${hongKong}`,
  position: { lat: 22.307862, lng: 113.922394 },
  title: 'HKG // Hong Kong International',
};

export const PER: Location = {
  description: `Perth, ${australia}`,
  position: { lat: -31.938471, lng: 115.967523 },
  title: 'PER // Perth',
};

export const DPS: Location = {
  description: 'Denpasar, Bali',
  position: { lat: -8.746727, lng: 115.166801 },
  title: 'DPS // Ngurah Rai International',
};

export const DRW: Location = {
  description: `Darwin, ${australia}`,
  position: { lat: -12.411127, lng: 130.878227 },
  title: 'DRW // Darwin International',
};

export const ADL: Location = {
  description: `Adelaide, ${australia}`,
  position: { lat: -34.946134, lng: 138.533726 },
  title: 'ADL // Adelaide',
};

export const SYD: Location = {
  description: `Sydney, ${australia}`,
  position: { lat: -33.939953, lng: 151.175249 },
  title: 'SYD // Kingsford Smith',
};

export const HLZ: Location = {
  description: `Hamilton, ${newZealand}`,
  position: { lat: -37.86547, lng: 175.337267 },
  title: 'HLZ // Hamilton International',
};

export const CHC: Location = {
  description: `Christchurch, ${newZealand}`,
  position: { lat: -43.486456, lng: 172.537369 },
  title: 'CHC // Christchurch International',
};

export const ZQN: Location = {
  description: `Queenstown, ${newZealand}`,
  position: { lat: -45.020983, lng: 168.740325 },
  title: 'ZQN // Queenstown',
};

export const AKL: Location = {
  description: `Auckland, ${newZealand}`,
  position: { lat: -37.008227, lng: 174.78576 },
  title: 'AKL // Auckland',
};

export const WLG: Location = {
  description: `Wellington, ${newZealand}`,
  position: { lat: -41.327551, lng: 174.808308 },
  title: 'WLG // Wellington International',
};

export const NSN: Location = {
  description: `Nelson, ${newZealand}`,
  position: { lat: -41.30002, lng: 173.225254 },
  title: 'NSN // Nelson',
};

export const TRG: Location = {
  description: `Tauranga, ${newZealand}`,
  position: { lat: -37.672093, lng: 176.197666 },
  title: 'TRG // Tauranga',
};

export const ROT: Location = {
  description: `Rotorua, ${newZealand}`,
  position: { lat: -38.109354, lng: 176.317118 },
  title: 'ROT // Rotorua International',
};

export const RAR: Location = {
  description: 'Avarua, Cook Islands',
  position: { lat: -21.20231, lng: -159.805334 },
  title: 'RAR // Rarotonga International',
};

export const NRT: Location = {
  description: `Tokyo, ${japan}`,
  position: { lat: 35.771991, lng: 140.3906614 },
  title: 'NRT // Narita International',
};

export const SIN: Location = {
  description: 'Singapore, Singapore',
  position: { lat: 1.3644256, lng: 103.9893421 },
  title: 'SIN // Singapore Changi',
};

export const ARN: Location = {
  description: `Stockholm, ${sweden}`,
  position: { lat: 59.6497649, lng: 17.921592 },
  title: 'ARN // Stockholm Arlanda',
};

export const BGO: Location = {
  description: `Bergen, ${norway}`,
  position: { lat: 60.2918326, lng: 5.2198286 },
  title: 'BGO // Bergen',
};

export const TRD: Location = {
  description: `Trondheim, ${norway}`,
  position: { lat: 63.4582722, lng: 10.9204103 },
  title: 'TRD // Trondheim',
};

export const BOO: Location = {
  description: `Bodø, ${norway}`,
  position: { lat: 67.268313, lng: 14.3600464 },
  title: 'BOO // Bodø',
};

export const SJV: Location = {
  description: `Svolvær, ${norway}`,
  position: { lat: 68.243335, lng: 14.6669783 },
  title: 'SJV // Svolvær',
};

export const TOS: Location = {
  description: `Tromsø, ${norway}`,
  position: { lat: 69.6819372, lng: 18.914075 },
  title: 'TOS // Tromsø',
};

export const TIU: Location = {
  description: `Timaru, ${newZealand}`,
  position: { lat: -44.303448, lng: 171.2241313 },
  title: 'TIU // Richard Pearse',
};

export const CBR: Location = {
  description: `Canberra, ${australia}`,
  position: { lat: -35.3032616, lng: 149.1746154 },
  title: 'CBR // Canberra',
};

export const NPL: Location = {
  description: `New Plymouth, ${newZealand}`,
  position: { lat: -39.007847, lng: 174.1754103 },
  title: 'NPL // New Plymouth',
};

export const KBV: Location = {
  description: `Krabi, ${thailand}`,
  position: { lat: 8.0992802, lng: 98.9810008 },
  title: 'KBV // Krabi',
};

export const HKT: Location = {
  description: `Phuket, ${thailand}`,
  position: { lat: 8.1103541, lng: 98.3081319 },
  title: 'HKT // Phuket International',
};

export const MEL: Location = {
  description: `Melbourne, ${australia}`,
  position: { lat: -37.6662769, lng: 144.8354746 },
  title: 'MEL // Melbourne (Tullamarine)',
};

export const GIS: Location = {
  description: `Gisborne, ${newZealand}`,
  position: { lat: -38.6628665, lng: 177.9806031 },
  title: 'GIS // Gisborne',
};

export const CXH: Location = {
  description: `Vancouver, ${canada}`,
  position: { lat: 49.290761, lng: -123.118453 },
  title: 'CXH // Seaplane Terminal',
};

export const YWH: Location = {
  description: `Victoria, ${canada}`,
  position: { lat: 48.423626, lng: -123.371034 },
  title: 'YWH // Victoria Harbour',
};

export const PEK: Location = {
  description: `Beijing, ${china}`,
  position: { lat: 40.079383, lng: 116.6061803 },
  title: 'PEK // Beijing Capital International',
};

export const PVG: Location = {
  description: `Shanghai, ${china}`,
  position: { lat: 31.1443485, lng: 121.8060843 },
  title: 'PVG // Shanghai Pudong International',
};

export const DUD: Location = {
  description: `Dunedin, ${newZealand}`,
  position: { lat: -45.924735, lng: 170.201256 },
  title: 'DUD // Dunedin International',
};

export const BNE: Location = {
  description: `Brisbane, ${australia}`,
  position: { lat: -27.394414, lng: 153.121251 },
  title: 'BNE // Brisbane International',
};

export const LAX: Location = {
  description: `Los Angeles, ${unitedStates}`,
  position: { lat: 33.941709, lng: -118.40904 },
  title: 'LAX // Los Angeles International',
};

export const YUL: Location = {
  description: `Montréal, ${canada}`,
  position: { lat: 45.465821, lng: -73.745975 },
  title: 'YUL // Pierre Elliott Trudeau International',
};

export const SFO: Location = {
  description: `San Francisco, ${unitedStates}`,
  position: { lat: 37.621432, lng: -122.379342 },
  title: 'SFO // San Francisco International',
};

export const OOL: Location = {
  description: `Gold Coast, ${australia}`,
  position: { lat: -28.1662421, lng: 153.5064202 },
  title: 'OOL // Gold Coast Airport',
};

export const HBA: Location = {
  description: `Hobart, ${australia}`,
  position: { lat: -42.836354, lng: 147.5048859 },
  title: 'HBA // Hobart International',
};

export const PPQ: Location = {
  description: `Paraparaumu, ${newZealand}`,
  position: { lat: -40.904148, lng: 174.989765 },
  title: 'PPQ // Kapiti Coast Airport',
};

export const MQP: Location = {
  description: `Nelspruit, ${southAfrica}`,
  position: { lat: -25.382502, lng: 31.106561 },
  title: 'MQP // Kruger Mpumalanga International',
};

export const airports: Location[] = [
  KIM,
  PLZ,
  ELS,
  JNB,
  AMS,
  LHR,
  NBO,
  CPT,
  MBD,
  DUR,
  BFN,
  GRJ,
  MPM,
  GBE,
  WDH,
  BUQ,
  HRE,
  LVI,
  LUN,
  LAD,
  DAR,
  EBB,
  FIH,
  LOS,
  ABJ,
  ACC,
  DKR,
  SID,
  MIA,
  ATL,
  IAD,
  JFK,
  LGA,
  MRU,
  HKG,
  PER,
  SYD,
  EZE,
  GRU,
  YVR,
  FRA,
  ZRH,
  CDG,
  CPH,
  BOM,
  BKK,
  KIX,
  BKKN,
  USM,
  HKGN,
  DPS,
  DRW,
  ADL,
  HLZ,
  CHC,
  ZQN,
  AKL,
  WLG,
  NSN,
  TRG,
  ROT,
  RAR,
  NRT,
  SIN,
  ARN,
  BGO,
  TRD,
  BOO,
  SJV,
  TOS,
  TIU,
  CBR,
  NPL,
  KBV,
  HKT,
  MEL,
  GIS,
  CXH,
  YWH,
  PEK,
  PVG,
  DUD,
  BNE,
  LAX,
  YUL,
  SFO,
  OOL,
  HBA,
  PPQ,
  MQP,
];
