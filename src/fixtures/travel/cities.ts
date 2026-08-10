import { newZealand, southAfrica, unitedKingdom } from './countries';
import { currentCityIcon, previousCityIcon } from './icons';
import type { City } from './types';

const lived = "I've lived here...";

export const aucklandPoint: google.maps.LatLngLiteral = {
  lat: -36.847639,
  lng: 174.762473,
};

const hartswater: City = {
  description: 'I was born here...',
  icon: previousCityIcon,
  position: {
    lat: -27.746947,
    lng: 24.760681,
  },
  title: `Hartswater, ${southAfrica}`,
};

const heidelberg: City = {
  description: 'I grew up here...',
  icon: previousCityIcon,
  position: {
    lat: -34.025956,
    lng: 20.937695,
  },
  title: `Heidelberg, ${southAfrica}`,
};

const vryburg: City = {
  description: 'I went to High School here...',
  icon: previousCityIcon,
  position: {
    lat: -26.952586,
    lng: 24.716451,
  },
  title: `Vryburg, ${southAfrica}`,
};

const london: City = {
  description: lived,
  icon: previousCityIcon,
  position: {
    lat: 51.451005,
    lng: -0.14797,
  },
  title: `London, ${unitedKingdom}`,
};

const johannesburg: City = {
  description: lived,
  icon: previousCityIcon,
  position: {
    lat: -26.172906,
    lng: 28.310071,
  },
  title: `Johannesburg, ${southAfrica}`,
};

const capeTown: City = {
  description: 'I moved to NZ from here...',
  icon: previousCityIcon,
  position: {
    lat: -33.93462,
    lng: 18.406203,
  },
  title: `Cape Town, ${southAfrica}`,
};

const hamilton: City = {
  description: lived,
  icon: previousCityIcon,
  position: {
    lat: -37.779755,
    lng: 175.277283,
  },
  title: `Hamilton, ${newZealand}`,
};

const auckland: City = {
  description: lived,
  icon: previousCityIcon,
  position: aucklandPoint,
  title: `Auckland, ${newZealand}`,
};

const eastbourne: City = {
  description: lived,
  icon: previousCityIcon,
  position: {
    lat: -41.300614,
    lng: 174.892839,
  },
  title: `Eastbourne, Lower Hutt, ${newZealand}`,
};

const wellington: City = {
  description: lived,
  icon: previousCityIcon,
  position: {
    lat: -41.30368,
    lng: 174.763941,
  },
  title: `Wellington, ${newZealand}`,
};

const silverstream: City = {
  description: lived,
  icon: previousCityIcon,
  position: {
    lat: -41.1497301,
    lng: 175.005017,
  },
  title: `Silverstream, Upper Hutt, ${newZealand}`,
};

const mosselBay: City = {
  current: true,
  description: 'I currently live in this area...',
  icon: currentCityIcon,
  position: {
    lat: -34.181985,
    lng: 22.145697,
  },
  title: `Mossel Bay, ${southAfrica}`,
};

export const cities: City[] = [
  hartswater,
  heidelberg,
  vryburg,
  london,
  johannesburg,
  capeTown,
  hamilton,
  auckland,
  eastbourne,
  wellington,
  silverstream,
  mosselBay,
];

const currentCities = cities.filter(city => city.current);

if (currentCities.length !== 1) {
  throw new Error('Travel fixtures must contain exactly one current city');
}

export const currentCityPoint = currentCities[0].position;
