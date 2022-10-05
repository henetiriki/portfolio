import { PolylineIconSequence } from '@fixtures/map';
import { delay } from '@utils/common';

export class PolylineUtil {
  private _lineDrawWait = 0;
  private _polylines: Array<google.maps.Polyline> = [];
  private _dottedPolylines: Array<PolylineIconSequence> = [];
  private _weightBase = 1.25;
  private _weightExp1 = 1;
  private _weightExp2 = 2;
  private _weightExp3 = 3;
  private _weightExp4 = 4;
  private _weightExp5 = 6;

  constructor() {}

  createPolylines(
    journeys: google.maps.LatLngLiteral[][],
    map: google.maps.Map,
    strokeColor: string
  ): Array<google.maps.Polyline> {
    const lines: Array<google.maps.Polyline> = [];

    journeys.forEach((_journey: google.maps.LatLngLiteral[], index: number) => {
      lines[index] = new google.maps.Polyline({
        geodesic: true,
        map,
        strokeColor,
        strokeOpacity: 0.9,
        strokeWeight: this._weightBase,
        zIndex: 2,
      });
    });

    this._polylines.push(...lines);

    return lines;
  }

  createPolylineFromPath(
    encodedPaths: Array<string>,
    map: google.maps.Map,
    strokeColor: string
  ): void {
    encodedPaths.forEach((encodedPath: string) => {
      const path: Array<google.maps.LatLng> =
        google.maps.geometry.encoding.decodePath(encodedPath);
      const line: google.maps.Polyline = new google.maps.Polyline({
        path,
        strokeColor,
        strokeOpacity: 0.9,
        strokeWeight: this._weightBase,
        zIndex: 2,
      });

      this._polylines.push(line);
      delay(++this._lineDrawWait * 130).then(() => {
        line.setMap(map);
      });
    });
  }

  createDottedPolylines(
    journeys: google.maps.LatLngLiteral[][],
    map: google.maps.Map,
    strokeColor: string
  ): Array<google.maps.Polyline> {
    const lines: Array<google.maps.Polyline> = [];

    journeys.forEach((_journey: google.maps.LatLngLiteral[], index: number) => {
      const linesIcons: google.maps.IconSequence[] = [
        {
          icon: {
            path: 'M 0, -1 0,1',
            strokeColor,
            strokeOpacity: 0.9,
            strokeWeight: this._weightBase,
          },
          offset: '0',
          repeat: '12px',
        },
      ] as google.maps.IconSequence[];
      const polyline = new google.maps.Polyline({
        geodesic: true,
        icons: linesIcons,
        map,
        strokeOpacity: 0,
        zIndex: 2,
      });

      lines[index] = polyline;
      this._dottedPolylines.push({ linesIcons, polyline });
    });

    return lines;
  }

  createDottedPolylineFromPath(
    encodedPaths: Array<string>,
    map: google.maps.Map,
    strokeColor: string
  ): void {
    encodedPaths.forEach((encodedPath: string) => {
      const path: Array<google.maps.LatLng> =
        google.maps.geometry.encoding.decodePath(encodedPath);
      const linesIcons: google.maps.IconSequence[] = [
        {
          icon: {
            path: 'M 0, -1 0,1',
            strokeColor,
            strokeOpacity: 0.9,
            strokeWeight: this._weightBase,
          },
          offset: '0',
          repeat: '12px',
        },
      ] as google.maps.IconSequence[];
      const polyline: google.maps.Polyline = new google.maps.Polyline({
        icons: linesIcons,
        path,
        strokeOpacity: 0,
        zIndex: 2,
      });

      this._dottedPolylines.push({ linesIcons, polyline });
      delay(++this._lineDrawWait * 130).then(() => {
        polyline.setMap(map);
      });
    });
  }

  pushToPolylines(
    polylines: Array<google.maps.Polyline>,
    journeys: google.maps.LatLngLiteral[][]
  ): void {
    journeys.forEach((journey: google.maps.LatLngLiteral[], index: number) => {
      const polyline: google.maps.Polyline = polylines[index];

      this._lineDrawWait++;
      journey.forEach((leg: google.maps.LatLngLiteral) =>
        delay(this._lineDrawWait * 130).then(() => {
          const coordinates = new google.maps.LatLng(leg.lat, leg.lng);

          polyline.getPath().push(coordinates);
        })
      );
    });
  }

  setZoomChangedListener(map: google.maps.Map): void {
    google.maps.event.addListener(map, 'zoom_changed', () => {
      const zoom: number = map.getZoom() || 2;
      const weightExponent: number = this.getWeightExponent(zoom);
      const strokeWeight = this._weightBase * weightExponent;

      this._polylines.forEach((polyline: google.maps.Polyline) => {
        polyline.setOptions({
          strokeWeight,
        });
      });

      if (zoom < 18) {
        this._dottedPolylines.forEach(
          (dottedPolyline: PolylineIconSequence) => {
            // @ts-ignore
            dottedPolyline.linesIcons[0].icon.strokeWeight = strokeWeight;
            dottedPolyline.polyline.setOptions({
              icons: dottedPolyline.linesIcons,
            });
          }
        );
      }
    });
  }

  private getWeightExponent(zoom: number): number {
    switch (true) {
      case zoom <= 4:
        return this._weightExp1;
      case zoom <= 8:
        return this._weightExp2;
      case zoom <= 12:
        return this._weightExp3;
      case zoom <= 17:
        return this._weightExp4;
      case zoom <= 22:
        return this._weightExp5;
      default:
        return this._weightExp1;
    }
  }
}
