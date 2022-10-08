export interface Location {
  description: string;
  position: google.maps.LatLngLiteral;
  title: string;
}

export interface City extends Location {
  current?: boolean;
  icon: google.maps.Symbol;
}

export interface RailTrip {
  path: string;
  trip: string;
}

export interface MarkerLocations {
  icon: google.maps.Symbol;
  locations: Location[];
}

export interface RailTrips {
  railTrips: RailTrip[];
  upcomingRailTrips: RailTrip[];
}

export interface PolylineIconSequence {
  linesIcons: google.maps.IconSequence[];
  polyline: google.maps.Polyline;
}
