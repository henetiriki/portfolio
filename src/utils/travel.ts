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
      return 1.5;
    case zoom <= 12:
      return 2;
    case zoom <= 16:
      return 2.5;
    case zoom <= 20:
      return 3;
    case zoom <= 24:
      return 3.5;
    default:
      return 1;
  }
};
