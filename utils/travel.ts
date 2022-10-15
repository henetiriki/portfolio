export const getZoomMarkerWeightExponent = (zoom: number = 0): number => {
  switch (true) {
    case zoom <= 10:
      return 1;
    case zoom <= 16:
      return 1.5;
    case zoom <= 22:
      return 2.25;
    default:
      return 1;
  }
};

export const getZoomPolylineWeightExponent = (zoom: number = 0): number => {
  switch (true) {
    case zoom <= 4:
      return 1;
    case zoom <= 8:
      return 1.25;
    case zoom <= 12:
      return 1.75;
    case zoom <= 16:
      return 2;
    case zoom <= 20:
      return 2.25;
    case zoom <= 24:
      return 2.75;
    default:
      return 1;
  }
};
