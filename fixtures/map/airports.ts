import {
  AUSTRALIA,
  CANADA,
  CHINA,
  GERMANY,
  HONG_KONG,
  JAPAN,
  NEW_ZEALAND,
  NORWAY,
  SOUTH_AFRICA,
  SWEDEN,
  THAILAND,
  UK,
  USA,
  ZAMBIA,
  ZIMBABWE,
} from './countries';
import { Airport } from './types';

export const JNB: Airport = {
  city: 'Johannesburg',
  country: SOUTH_AFRICA,
  iataCode: 'JNB',
  position: { lat: -26.136837, lng: 28.241157 },
  title: 'OR Tambo International',
};

export const CPT: Airport = {
  city: 'Cape Town',
  country: SOUTH_AFRICA,
  iataCode: 'CPT',
  position: { lat: -33.971459, lng: 18.602241 },
  title: 'Cape Town International',
};

export const MBD: Airport = {
  city: 'Mafikeng',
  country: SOUTH_AFRICA,
  iataCode: 'MBD',
  position: { lat: -25.807261, lng: 25.544465 },
  title: 'Mafikeng International',
};

export const DUR: Airport = {
  city: 'Durban',
  country: SOUTH_AFRICA,
  iataCode: 'DUR',
  position: { lat: -29.967507, lng: 30.947187 },
  title: 'Durban International',
};

export const KIM: Airport = {
  city: 'Kimberley',
  country: SOUTH_AFRICA,
  iataCode: 'KIM',
  position: { lat: -28.802682, lng: 24.765399 },
  title: 'Kimberley',
};

export const BFN: Airport = {
  city: 'Bloemfontein',
  country: SOUTH_AFRICA,
  iataCode: 'BFN',
  position: { lat: -29.095735, lng: 26.298145 },
  title: 'Bram Fischer International',
};

export const PLZ: Airport = {
  city: 'Port Elizabeth',
  country: SOUTH_AFRICA,
  iataCode: 'PLZ',
  position: { lat: -33.986448, lng: 25.61039 },
  title: 'Port Elizabeth',
};

export const ELS: Airport = {
  city: 'East London',
  country: SOUTH_AFRICA,
  iataCode: 'ELS',
  position: { lat: -33.038191, lng: 27.828955 },
  title: 'East London',
};

export const GRJ: Airport = {
  city: 'George',
  country: SOUTH_AFRICA,
  iataCode: 'GRJ',
  position: { lat: -34.005193, lng: 22.378423 },
  title: 'George',
};

export const MPM: Airport = {
  city: 'Maputo',
  country: 'Mozambique',
  iataCode: 'MPM',
  position: { lat: -25.919804, lng: 32.572997 },
  title: 'Maputo International',
};

export const GBE: Airport = {
  city: 'Gaborone',
  country: 'Botswana',
  iataCode: 'GBE',
  position: { lat: -24.555994, lng: 25.918776 },
  title: 'Sir Seretse Khama International',
};

export const WDH: Airport = {
  city: 'Windhoek',
  country: 'Namibia',
  iataCode: 'WDH',
  position: { lat: -22.480292, lng: 17.470903 },
  title: 'Hosea Kutako International',
};

export const BUQ: Airport = {
  city: 'Bulawayo',
  country: ZIMBABWE,
  iataCode: 'BUQ',
  position: { lat: -20.018368, lng: 28.624652 },
  title: 'Joshua Mqabuko Nkomo International',
};

export const HRE: Airport = {
  city: 'Harare',
  country: ZIMBABWE,
  iataCode: 'HRE',
  position: { lat: -17.918871, lng: 31.097359 },
  title: 'Harare International',
};

export const LVI: Airport = {
  city: 'Livingstone ',
  country: ZAMBIA,
  iataCode: 'LVI',
  position: { lat: -17.818925, lng: 25.818595 },
  title: 'Harry Mwanga Nkumbula International',
};

export const LUN: Airport = {
  city: 'Lusaka',
  country: ZAMBIA,
  iataCode: 'LUN',
  position: { lat: -15.330899, lng: 28.454393 },
  title: 'Kenneth Kaunda International',
};

export const LAD: Airport = {
  city: 'Luanda',
  country: 'Angola',
  iataCode: 'LAD',
  position: { lat: -8.848009, lng: 13.2349 },
  title: 'Quatro de Fevereiro',
};

export const DAR: Airport = {
  city: 'Dar es Salaam',
  country: 'Tanzania',
  iataCode: 'DAR',
  position: { lat: -6.872619, lng: 39.206986 },
  title: 'Julius Nyerere International',
};

export const EBB: Airport = {
  city: 'Entebbe',
  country: 'Uganda',
  iataCode: 'EBB',
  position: { lat: 0.044929, lng: 32.44288 },
  title: 'Entebbe International',
};

export const NBO: Airport = {
  city: 'Nairobi',
  country: 'Kenya',
  iataCode: 'NBO',
  position: { lat: -1.322705, lng: 36.926611 },
  title: 'Jomo Kenyatta International',
};

export const FIH: Airport = {
  city: 'Kinshasa',
  country: 'Congo (DRC)',
  iataCode: 'FIH',
  position: { lat: -4.385679, lng: 15.444503 },
  title: `N'djili International`,
};

export const LOS: Airport = {
  city: 'Lagos',
  country: 'Nigeria',
  iataCode: 'LOS',
  position: { lat: 6.581759, lng: 3.321484 },
  title: 'Murtala Muhammed International',
};

export const ABJ: Airport = {
  city: 'Abidjan',
  country: "Côte d'Ivoire",
  iataCode: 'ABJ',
  position: { lat: 5.254863, lng: -3.93287 },
  title: 'Felix Houphouet Boigny',
};

export const ACC: Airport = {
  city: 'Accra',
  country: 'Ghana',
  iataCode: 'ACC',
  position: { lat: 5.606068, lng: -0.168107 },
  title: 'Kotoka International',
};

export const DKR: Airport = {
  city: 'Dakar',
  country: 'Senegal',
  iataCode: 'DKR',
  position: { lat: 14.744887, lng: -17.490146 },
  title: 'Léopold Sédar Senghor International',
};

export const SID: Airport = {
  city: 'Ilha do Sal',
  country: 'Cape Verde',
  iataCode: 'SID',
  position: { lat: 16.734608, lng: -22.943608 },
  title: 'Amilcar Cabral International',
};

export const MRU: Airport = {
  city: 'Plaine Magnien',
  country: 'Mauritius',
  iataCode: 'MRU',
  position: { lat: -20.430714, lng: 57.675511 },
  title: 'Sir Seewoosagur Ramgoolam',
};

export const GRU: Airport = {
  city: 'São Paulo',
  country: 'Brazil',
  iataCode: 'GRU',
  position: { lat: -23.434617, lng: -46.478013 },
  title: 'Guarulhos International',
};

export const EZE: Airport = {
  city: 'Beunos Aires',
  country: 'Argentina',
  iataCode: 'EZE',
  position: { lat: -34.822544, lng: -58.534969 },
  title: 'Ministro Pistarini International',
};

export const MIA: Airport = {
  city: 'Miami',
  country: USA,
  iataCode: 'MIA',
  position: { lat: 25.795947, lng: -80.286611 },
  title: 'Miami International',
};

export const ATL: Airport = {
  city: 'Atlanta',
  country: USA,
  iataCode: 'ATL',
  position: { lat: 33.640795, lng: -84.427223 },
  title: 'Hartsfield–Jackson Atlanta International',
};

export const IAD: Airport = {
  city: 'Washington',
  country: USA,
  iataCode: 'IAD',
  position: { lat: 38.952765, lng: -77.451732 },
  title: 'Washington Dulles International',
};

export const JFK: Airport = {
  city: 'New York',
  country: USA,
  iataCode: 'JFK',
  position: { lat: 40.641242, lng: -73.777941 },
  title: 'John F. Kennedy International',
};

export const LGA: Airport = {
  city: 'New York',
  country: USA,
  iataCode: 'LGA',
  position: { lat: 40.776992, lng: -73.873376 },
  title: 'LaGuardia',
};

export const YVR: Airport = {
  city: 'Vancouver',
  country: CANADA,
  iataCode: 'YVR',
  position: { lat: 49.196659, lng: -123.181056 },
  title: 'Vancouver International',
};

export const LHR: Airport = {
  city: 'London',
  country: UK,
  iataCode: 'LHR',
  position: { lat: 51.469979, lng: -0.454044 },
  title: 'London Heathrow',
};

export const FRA: Airport = {
  city: 'Frankfurt',
  country: GERMANY,
  iataCode: 'FRA',
  position: { lat: 50.037936, lng: 8.562608 },
  title: 'Frankfurt',
};

export const ZRH: Airport = {
  city: 'Zurich',
  country: 'Switzerland',
  iataCode: 'ZRH',
  position: { lat: 47.458256, lng: 8.555717 },
  title: 'Zurich',
};

export const CDG: Airport = {
  city: 'Paris',
  country: 'France',
  iataCode: 'CDG',
  position: { lat: 49.009702, lng: 2.548251 },
  title: 'Charles de Gaulle',
};

export const CPH: Airport = {
  city: 'Copenhagen',
  country: 'Denmark',
  iataCode: 'CPH',
  position: { lat: 55.618039, lng: 12.651198 },
  title: 'Copenhagen',
};

export const AMS: Airport = {
  city: 'Amsterdam',
  country: 'Netherlands',
  iataCode: 'AMS',
  position: { lat: 52.310523, lng: 4.76874 },
  title: 'Amsterdam Airport Schiphol',
};

export const BOM: Airport = {
  city: 'Mumbai',
  country: 'India',
  iataCode: 'BOM',
  position: { lat: 19.090121, lng: 72.868905 },
  title: 'Chhatrapati Shivaji International',
};

export const BKK: Airport = {
  city: 'Bangkok',
  country: THAILAND,
  iataCode: 'BKK',
  position: { lat: 13.913019, lng: 100.604164 },
  title: 'Donmuang (old)',
};

export const BKKN: Airport = {
  city: 'Bangkok',
  country: THAILAND,
  iataCode: 'BKK',
  position: { lat: 13.689084, lng: 100.751023 },
  title: 'Suvarnabhumi',
};

export const KIX: Airport = {
  city: 'Osaka',
  country: JAPAN,
  iataCode: 'KIX',
  position: { lat: 34.432015, lng: 135.230817 },
  title: 'Kansai International',
};

export const USM: Airport = {
  city: 'Koh Samui',
  country: THAILAND,
  iataCode: 'USM',
  position: { lat: 9.548389, lng: 100.063484 },
  title: 'Koh Samui',
};

export const HKG: Airport = {
  city: HONG_KONG,
  country: HONG_KONG,
  iataCode: 'HKG',
  position: { lat: 22.324767, lng: 114.19859 },
  title: 'Kai Tak (old)',
};

export const HKGN: Airport = {
  city: 'Chek Lap Kok',
  country: HONG_KONG,
  iataCode: 'HKG',
  position: { lat: 22.307862, lng: 113.922394 },
  title: 'Hong Kong International',
};

export const PER: Airport = {
  city: 'Perth',
  country: AUSTRALIA,
  iataCode: 'PER',
  position: { lat: -31.938471, lng: 115.967523 },
  title: 'Perth',
};

export const DPS: Airport = {
  city: 'Denpasar',
  country: 'Bali',
  iataCode: 'DPS',
  position: { lat: -8.746727, lng: 115.166801 },
  title: 'Ngurah Rai International',
};

export const DRW: Airport = {
  city: 'Darwin',
  country: AUSTRALIA,
  iataCode: 'DRW',
  position: { lat: -12.411127, lng: 130.878227 },
  title: 'Darwin International',
};

export const ADL: Airport = {
  city: 'Adelaide',
  country: AUSTRALIA,
  iataCode: 'ADL',
  position: { lat: -34.946134, lng: 138.533726 },
  title: 'Adelaide',
};

export const SYD: Airport = {
  city: 'Sydney',
  country: AUSTRALIA,
  iataCode: 'SYD',
  position: { lat: -33.939953, lng: 151.175249 },
  title: 'Kingsford Smith',
};

export const HLZ: Airport = {
  city: 'Hamilton',
  country: NEW_ZEALAND,
  iataCode: 'HLZ',
  position: { lat: -37.86547, lng: 175.337267 },
  title: 'Hamilton International',
};

export const CHC: Airport = {
  city: 'Christchurch',
  country: NEW_ZEALAND,
  iataCode: 'CHC',
  position: { lat: -43.486456, lng: 172.537369 },
  title: 'Christchurch International',
};

export const ZQN: Airport = {
  city: 'Queenstown',
  country: NEW_ZEALAND,
  iataCode: 'ZQN',
  position: { lat: -45.020983, lng: 168.740325 },
  title: 'Queenstown',
};

export const AKL: Airport = {
  city: 'Auckland',
  country: NEW_ZEALAND,
  iataCode: 'AKL',
  position: { lat: -37.008227, lng: 174.78576 },
  title: 'Auckland',
};

export const WLG: Airport = {
  city: 'Wellington',
  country: NEW_ZEALAND,
  iataCode: 'WLG',
  position: { lat: -41.327551, lng: 174.808308 },
  title: 'Wellington International',
};

export const NSN: Airport = {
  city: 'Nelson',
  country: NEW_ZEALAND,
  iataCode: 'NSN',
  position: { lat: -41.30002, lng: 173.225254 },
  title: 'Nelson',
};

export const TRG: Airport = {
  city: 'Tauranga',
  country: NEW_ZEALAND,
  iataCode: 'TRG',
  position: { lat: -37.672093, lng: 176.197666 },
  title: 'Tauranga',
};

export const ROT: Airport = {
  city: 'Rotorua',
  country: NEW_ZEALAND,
  iataCode: 'ROT',
  position: { lat: -38.109354, lng: 176.317118 },
  title: 'Rotorua International',
};

export const RAR: Airport = {
  city: 'Avarua',
  country: 'Cook Islands',
  iataCode: 'RAR',
  position: { lat: -21.20231, lng: -159.805334 },
  title: 'Rarotonga International',
};

export const NRT: Airport = {
  city: 'Tokyo',
  country: JAPAN,
  iataCode: 'NRT',
  position: { lat: 35.771991, lng: 140.3906614 },
  title: 'Narita International',
};

export const SIN: Airport = {
  city: 'Singapore',
  country: 'Singapore',
  iataCode: 'SIN',
  position: { lat: 1.3644256, lng: 103.9893421 },
  title: 'Singapore Changi',
};

export const ARN: Airport = {
  city: 'Stockholm',
  country: SWEDEN,
  iataCode: 'ARN',
  position: { lat: 59.6497649, lng: 17.921592 },
  title: 'Stockholm Arlanda',
};

export const BGO: Airport = {
  city: 'Bergen',
  country: NORWAY,
  iataCode: 'BGO',
  position: { lat: 60.2918326, lng: 5.2198286 },
  title: 'Bergen',
};

export const TRD: Airport = {
  city: 'Trondheim',
  country: NORWAY,
  iataCode: 'TRD',
  position: { lat: 63.4582722, lng: 10.9204103 },
  title: 'Trondheim',
};

export const BOO: Airport = {
  city: 'Bodø',
  country: NORWAY,
  iataCode: 'BOO',
  position: { lat: 67.268313, lng: 14.3600464 },
  title: 'Bodø',
};

export const SJV: Airport = {
  city: 'Svolvær',
  country: NORWAY,
  iataCode: 'SJV',
  position: { lat: 68.243335, lng: 14.6669783 },
  title: 'Svolvær',
};

export const TOS: Airport = {
  city: 'Tromsø',
  country: NORWAY,
  iataCode: 'TOS',
  position: { lat: 69.6819372, lng: 18.914075 },
  title: 'Tromsø',
};

export const TIU: Airport = {
  city: 'Timaru',
  country: NEW_ZEALAND,
  iataCode: 'TIU',
  position: { lat: -44.303448, lng: 171.2241313 },
  title: 'Richard Pearse',
};

export const CBR: Airport = {
  city: 'Canberra',
  country: AUSTRALIA,
  iataCode: 'CBR',
  position: { lat: -35.3032616, lng: 149.1746154 },
  title: 'Canberra',
};

export const NPL: Airport = {
  city: 'New Plymouth',
  country: NEW_ZEALAND,
  iataCode: 'NPL',
  position: { lat: -39.007847, lng: 174.1754103 },
  title: 'New Plymouth',
};

export const KBV: Airport = {
  city: 'Krabi',
  country: THAILAND,
  iataCode: 'KBV',
  position: { lat: 8.0992802, lng: 98.9810008 },
  title: 'Krabi',
};

export const HKT: Airport = {
  city: 'Phuket',
  country: THAILAND,
  iataCode: 'HKT',
  position: { lat: 8.1103541, lng: 98.3081319 },
  title: 'Phuket International',
};

export const MEL: Airport = {
  city: 'Melbourne',
  country: AUSTRALIA,
  iataCode: 'MEL',
  position: { lat: -37.6662769, lng: 144.8354746 },
  title: 'Melbourne (Tullamarine)',
};

export const GIS: Airport = {
  city: 'Gisborne',
  country: NEW_ZEALAND,
  iataCode: 'GIS',
  position: { lat: -38.6628665, lng: 177.9806031 },
  title: 'Gisborne',
};

export const CXH: Airport = {
  city: 'Vancouver',
  country: CANADA,
  iataCode: 'CXH',
  position: { lat: 49.290761, lng: -123.118453 },
  title: 'Seaplane Terminal',
};

export const YWH: Airport = {
  city: 'Victoria',
  country: CANADA,
  iataCode: 'YWH',
  position: { lat: 48.423626, lng: -123.371034 },
  title: 'Victoria Harbour',
};

export const PEK: Airport = {
  city: 'Beijing',
  country: CHINA,
  iataCode: 'PEK',
  position: { lat: 40.079383, lng: 116.6061803 },
  title: 'Beijing Capital International',
};

export const PVG: Airport = {
  city: 'Shanghai',
  country: CHINA,
  iataCode: 'PVG',
  position: { lat: 31.1443485, lng: 121.8060843 },
  title: 'Shanghai Pudong International',
};

export const DUD: Airport = {
  city: 'Dunedin',
  country: NEW_ZEALAND,
  iataCode: 'DUD',
  position: { lat: -45.924735, lng: 170.201256 },
  title: 'Dunedin International',
};

export const BNE: Airport = {
  city: 'Brisbane',
  country: AUSTRALIA,
  iataCode: 'BNE',
  position: { lat: -27.394414, lng: 153.121251 },
  title: 'Brisbane International',
};

export const LAX: Airport = {
  city: 'Los Angeles',
  country: USA,
  iataCode: 'LAX',
  position: { lat: 33.941709, lng: -118.40904 },
  title: 'Los Angeles International',
};

export const YUL: Airport = {
  city: 'Montréal',
  country: CANADA,
  iataCode: 'YUL',
  position: { lat: 45.465821, lng: -73.745975 },
  title: 'Pierre Elliott Trudeau International',
};

export const SFO: Airport = {
  city: 'San Francisco',
  country: USA,
  iataCode: 'SFO',
  position: { lat: 37.621432, lng: -122.379342 },
  title: 'San Francisco International',
};

export const AIRPORTS: Airport[] = [
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
];
