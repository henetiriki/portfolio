export interface Location {
  description: string;
  position: google.maps.LatLngLiteral;
  title: string;
}

export interface City extends Location {
  current?: boolean;
  icon: google.maps.Symbol;
}

export interface MarkerLocations {
  icon: google.maps.Symbol;
  locations: Location[];
}

export interface TripPolylines {
  polylineOpts: google.maps.PolylineOptions;
  trips: google.maps.LatLngLiteral[][];
}

export type RailTripItem = {
  path: string;
  trip: string;
};

export type RailTrips = {
  trips: RailTripItem[];
  upcomingTrips: RailTripItem[];
};
