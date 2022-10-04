import { Size } from './types';

export const AIRPORT_MARKER_SIZE: Size = { height: 16, width: 16 };
export const CURRENT_MARKER_SIZE: Size = { height: 28, width: 28 };
export const PORT_MARKER_SIZE: Size = { ...AIRPORT_MARKER_SIZE };
export const PREVIOUS_MARKER_SIZE: Size = { height: 24, width: 24 };
export const STATION_MARKER_SIZE: Size = { ...AIRPORT_MARKER_SIZE };
