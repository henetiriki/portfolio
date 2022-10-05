const SHARE_ICON_PROPS: google.maps.Symbol = {
  anchor: new google.maps.Point(15, 30),
  fillOpacity: 0.95,
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  strokeWeight: 0,
};

export const PREVIOUS_CITY_ICON: google.maps.Symbol = {
  ...SHARE_ICON_PROPS,
  fillColor: '#e22734',
  scale: 1,
};

export const CURRENT_CITY_ICON: google.maps.Symbol = {
  ...SHARE_ICON_PROPS,
  fillColor: '#e25a00',
  scale: 1.5,
};

export const AIRPORT_ICON: google.maps.Symbol = {
  ...SHARE_ICON_PROPS,
  fillColor: '#f25fee',
  scale: 1.5,
};

export const PORT_ICON: google.maps.Symbol = {
  ...SHARE_ICON_PROPS,
  fillColor: '#101227',
  scale: 1.5,
};

export const STATION_ICON: google.maps.Symbol = {
  ...SHARE_ICON_PROPS,
  fillColor: '#4f4f4f',
  scale: 1.5,
};
