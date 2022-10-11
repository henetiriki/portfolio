import { delay } from '@utils/common';

export const zoomMap = (
  map: google.maps.Map,
  nextZoom: number = 0,
  maxZoom: number = 0
): void => {
  if (nextZoom < maxZoom) {
    const tilesLoadedEventListener: google.maps.MapsEventListener =
      google.maps.event.addListener(map, 'zoom_changed', () => {
        google.maps.event.removeListener(tilesLoadedEventListener);
        zoomMap(map, map.getZoom()! + 1, maxZoom);
      });

    delay(80).then(() => {
      map.setZoom(nextZoom);
    });

    return;
  }

  map.setOptions({ scrollwheel: true });
};
