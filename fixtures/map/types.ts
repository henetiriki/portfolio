interface Location {
  loc: google.maps.LatLngLiteral;
  name: string;
}

interface LocationCityCountry extends Location {
  city: string;
  country: string;
}

export interface City extends Location {
  current?: boolean;
  description: string;
  icon: google.maps.Symbol;
}

export interface Airport extends LocationCityCountry {
  iataCode: string;
}

export interface Port extends LocationCityCountry {
  portCode: string;
}

export interface Station extends LocationCityCountry {
  stationCode: string;
}

export interface RailTrip {
  path: string;
  trip: string;
}

export interface RailTrips {
  railTrips: RailTrip[];
  upcomingRailTrips: RailTrip[];
}

export interface PolylineIconSequence {
  linesIcons: google.maps.IconSequence[];
  polyline: google.maps.Polyline;
}
