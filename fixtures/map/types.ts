interface Location {
  city: string;
  country: string;
  loc: google.maps.LatLngLiteral;
  name: string;
}

export interface City extends Location {
  current?: boolean;
  description: string;
  icon: google.maps.Icon;
}

export interface Airport extends Location {
  iataCode: string;
}

export interface Port extends Location {
  portCode: string;
}

export interface Station extends Location {
  stationCode: string;
}

export interface RailTrip {
  path: string;
  trip: string;
}

export interface RailTrips {
  railTrips: Array<RailTrip>;
  upcomingRailTrips: Array<RailTrip>;
}

export interface PolylineIconSequence {
  linesIcons: google.maps.IconSequence[];
  polyline: google.maps.Polyline;
}
