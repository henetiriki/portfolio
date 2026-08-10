export interface Location {
  description: string;
  position: google.maps.LatLngLiteral;
  title: string;
}

export type MarkerIcon = {
  color: string;
  scale: number;
};

export interface City extends Location {
  current?: boolean;
  icon: MarkerIcon;
}

export interface MarkerLocations {
  icon: MarkerIcon;
  locations: Location[];
}

export interface TripPolylines {
  polylineOpts: google.maps.PolylineOptions;
  trips: google.maps.LatLngLiteral[][];
}

export interface TripPaths {
  polylineOpts: google.maps.PolylineOptions;
  tripPaths: string[][];
}

export type RailTripItem = {
  path: string;
  trip: string;
};

export type RailTrips = {
  trips: RailTripItem[];
  upcomingTrips: RailTripItem[];
};
