import {
  AIRPORT_ICON,
  AIRPORT_MARKER_OPTIONS,
  Airport,
  CITY_MARKER_OPTIONS,
  CURRENT_CITY_ICON,
  City,
  PORT_ICON,
  PORT_MARKER_OPTIONS,
  PREVIOUS_CITY_ICON,
  Port,
  STATION_ICON,
  STATION_MARKER_OPTIONS,
  Station,
} from '@fixtures/map';
import { cancelableDelay } from '@utils/common';

export class MarkerUtil {
  private _airportMarkers: Array<google.maps.Marker> = [];
  private _portMarkers: Array<google.maps.Marker> = [];
  private _stationMarkers: Array<google.maps.Marker> = [];
  private _cityMarkers: Array<google.maps.Marker> = [];
  private _infoWindow: google.maps.InfoWindow = new google.maps.InfoWindow();
  private _currentCityMarker: google.maps.Marker | undefined = undefined;
  private _sizeBase = 1;
  private _sizeExp1 = 1.25;
  private _sizeExp2 = 2;
  private _markerToBounce: google.maps.Marker | undefined = undefined;
  private _timeoutMarkerBounce: any;

  constructor() {}

  addAirportMarker(map: google.maps.Map, airport: Airport): void {
    const marker = new google.maps.Marker({
      ...AIRPORT_MARKER_OPTIONS,
      map,
      position: new google.maps.LatLng(airport.loc.lat, airport.loc.lng),
      title: `${airport.iataCode} // ${airport.name}`,
    });

    this._airportMarkers.push(marker);
    google.maps.event.addListener(marker, 'click', () => {
      this.toggleBounce(
        map,
        marker,
        airport.iataCode,
        `${airport.name}<br>${airport.city}, ${airport.country}`
      );
    });
  }

  addPortMarker(map: google.maps.Map, port: Port): void {
    const marker = new google.maps.Marker({
      ...PORT_MARKER_OPTIONS,
      map,
      position: new google.maps.LatLng(port.loc.lat, port.loc.lng),
      title: `${port.portCode} // ${port.name}`,
    });

    this._portMarkers.push(marker);
    google.maps.event.addListener(marker, 'click', () => {
      this.toggleBounce(
        map,
        marker,
        port.portCode,
        `${port.name}<br>${port.city}, ${port.country}`
      );
    });
  }

  addStationMarker(map: google.maps.Map, station: Station): void {
    const marker = new google.maps.Marker({
      ...STATION_MARKER_OPTIONS,
      map,
      position: new google.maps.LatLng(station.loc.lat, station.loc.lng),
      title: `${station.stationCode} // ${station.name}`,
    });

    this._stationMarkers.push(marker);
    google.maps.event.addListener(marker, 'click', () => {
      this.toggleBounce(
        map,
        marker,
        station.stationCode,
        `${station.name}<br>${station.city}, ${station.country}`
      );
    });
  }

  addCityMarker(
    map: google.maps.Map,
    city: City,
    cityMarkers: Array<google.maps.Marker>
  ): void {
    const cityMarker: google.maps.Marker = new google.maps.Marker({
      ...CITY_MARKER_OPTIONS,
      icon: city.icon,
      map,
      position: new google.maps.LatLng(city.loc.lat, city.loc.lng),
      title: city.name,
    });

    cityMarkers.push(cityMarker);
    if (city.current) {
      this._currentCityMarker = cityMarker;
    } else {
      this._cityMarkers.push(cityMarker);
    }
    google.maps.event.addListener(cityMarker, 'click', () => {
      this.toggleBounce(map, cityMarker, city.name, city.description);
    });
  }

  setZoomChangedListener(map: google.maps.Map): void {
    google.maps.event.addListener(map, 'zoom_changed', () => {
      const sizeExponent: number = this.getSizeExponent(map.getZoom() || 2);

      this._airportMarkers.forEach((marker: google.maps.Marker) =>
        this.setIcon(marker, AIRPORT_ICON, sizeExponent)
      );
      this._portMarkers.forEach((marker: google.maps.Marker) =>
        this.setIcon(marker, PORT_ICON, sizeExponent)
      );
      this._stationMarkers.forEach((marker: google.maps.Marker) =>
        this.setIcon(marker, STATION_ICON, sizeExponent)
      );
      this._cityMarkers.forEach((marker: google.maps.Marker) =>
        this.setIcon(marker, PREVIOUS_CITY_ICON, sizeExponent)
      );
      this.setIcon(this._currentCityMarker!, CURRENT_CITY_ICON, sizeExponent);
    });
  }

  private setIcon(
    marker: google.maps.Marker,
    icon: google.maps.Symbol,
    sizeExponent: number
  ): void {
    const { scale } = icon;

    marker.setIcon({
      ...icon,
      scale: (scale ?? 1) * sizeExponent,
    });
  }

  private toggleBounce(
    map: google.maps.Map,
    marker: google.maps.Marker,
    infoTitle: string,
    infoContent: string
  ): void {
    if (this._timeoutMarkerBounce) {
      clearTimeout(this._timeoutMarkerBounce);
      if (this._markerToBounce) {
        this._markerToBounce.setAnimation(null);
      }
    }
    this._markerToBounce = marker;
    this._markerToBounce.setAnimation(google.maps.Animation.BOUNCE);
    this._infoWindow.close();
    this._infoWindow.setContent(
      `<div class="map-info-window"><h3>${infoTitle}</h3><p>${infoContent}</p></div>`
    );
    this._infoWindow.open(map, this._markerToBounce);
    this._timeoutMarkerBounce = cancelableDelay(2000, () => {
      this._markerToBounce?.setAnimation(null);
      this._markerToBounce = undefined;
    });
  }

  private getSizeExponent(zoom: number): number {
    switch (true) {
      case zoom <= 10:
        return this._sizeBase;
      case zoom <= 17:
        return this._sizeExp1;
      case zoom <= 22:
        return this._sizeExp2;
      default:
        return this._sizeBase;
    }
  }
}
