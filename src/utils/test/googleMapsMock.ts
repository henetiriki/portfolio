/* eslint-disable @typescript-eslint/no-explicit-any */
type Handler = (...args: any[]) => void;

const listenerRegistry = new WeakMap<object, Map<string, Set<Handler>>>();

const addListener = (target: object, eventName: string, handler: Handler) => {
  if (!listenerRegistry.has(target)) {
    listenerRegistry.set(target, new Map());
  }

  const eventMap = listenerRegistry.get(target) as Map<string, Set<Handler>>;

  if (!eventMap.has(eventName)) {
    eventMap.set(eventName, new Set());
  }

  eventMap.get(eventName)?.add(handler);

  return {
    remove: () => {
      eventMap.get(eventName)?.delete(handler);
    },
  };
};

const removeListener = (listener: { remove: () => void }) => {
  listener.remove();
};

export const triggerMapsEvent = (
  target: object,
  eventName: string,
  ...args: any[]
) => {
  // Snapshot the listeners before iterating: a handler that synchronously
  // registers a new listener on this same event (e.g. Map.tsx's recursive
  // zoomMap) would otherwise have that new listener visited by this same
  // `forEach` too — Set.forEach sees elements added mid-iteration — causing
  // unbounded synchronous recursion instead of waiting for the next real
  // trigger. Real event systems (DOM, Node's EventEmitter) snapshot for
  // exactly this reason.
  const handlers = listenerRegistry.get(target)?.get(eventName);

  [...(handlers ?? [])].forEach(handler => {
    handler(...args);
  });
};

export class MockLatLng {
  private latValue: number;
  private lngValue: number;

  constructor(litOrLat: { lat: number; lng: number } | number, lng?: number) {
    if (typeof litOrLat === 'object') {
      this.latValue = litOrLat.lat;
      this.lngValue = litOrLat.lng;
    } else {
      this.latValue = litOrLat;
      this.lngValue = lng as number;
    }
  }

  equals(other: MockLatLng | undefined): boolean {
    return (
      other != null && this.lat() === other.lat() && this.lng() === other.lng()
    );
  }

  lat(): number {
    return this.latValue;
  }

  lng(): number {
    return this.lngValue;
  }
}

class MockLatLngBounds {
  constructor(
    public southWest?: MockLatLng,
    public northEast?: MockLatLng
  ) {}
}

export class MockMap {
  static instances: MockMap[] = [];

  panTo = jest.fn();

  setOptions = jest.fn((options: Record<string, unknown>) => {
    if (typeof options.zoom === 'number') {
      this.zoomValue = options.zoom;
    }
  });

  setZoom = jest.fn((zoom: number) => {
    this.zoomValue = zoom;
    triggerMapsEvent(this, 'zoom_changed');
  });

  private zoomValue = 0;

  constructor(
    public element: HTMLElement,
    public options: Record<string, unknown>
  ) {
    MockMap.instances.push(this);
  }

  getZoom(): number {
    return this.zoomValue;
  }
}

export class MockInfoWindow {
  static instances: MockInfoWindow[] = [];

  close = jest.fn(() => {
    this.isOpen = false;
    triggerMapsEvent(this, 'close');
  });

  isOpen = false;

  open = jest.fn(() => {
    this.isOpen = true;
    triggerMapsEvent(this, 'visible');
  });

  setContent = jest.fn();

  setHeaderContent = jest.fn();

  setHeaderDisabled = jest.fn();

  setOptions = jest.fn();

  constructor() {
    MockInfoWindow.instances.push(this);
  }
}

export class MockAdvancedMarkerElement extends HTMLElement {
  static instances: MockAdvancedMarkerElement[] = [];

  anchorLeft?: string;

  anchorTop?: string;

  gmpClickable?: boolean;

  map?: MockMap | null;

  position?: google.maps.LatLngLiteral;

  title = '';

  constructor(options: google.maps.marker.AdvancedMarkerElementOptions = {}) {
    super();
    Object.assign(this, options);
    MockAdvancedMarkerElement.instances.push(this);
  }
}

export class MockPolyline {
  static instances: MockPolyline[] = [];

  get = jest.fn(
    // eslint-disable-next-line security/detect-object-injection
    (key: string) => this.optionsValue[key]
  );

  set = jest.fn((key: string, value: unknown) => {
    // eslint-disable-next-line security/detect-object-injection
    this.optionsValue[key] = value;
  });

  setMap = jest.fn();

  setOptions = jest.fn((options: Record<string, unknown>) => {
    this.optionsValue = { ...this.optionsValue, ...options };
  });

  private optionsValue: Record<string, unknown> = {};

  constructor() {
    MockPolyline.instances.push(this);
  }
}

const decodePath = jest.fn(() => [
  new MockLatLng({ lat: 0, lng: 0 }),
  new MockLatLng({ lat: 1, lng: 1 }),
]);

export const installGoogleMapsMock = () => {
  if (!customElements.get('mock-advanced-marker')) {
    customElements.define('mock-advanced-marker', MockAdvancedMarkerElement);
  }

  (global as { google?: unknown }).google = {
    maps: {
      InfoWindow: MockInfoWindow,
      LatLng: MockLatLng,
      LatLngBounds: MockLatLngBounds,
      Map: MockMap,
      Polyline: MockPolyline,
      event: { addListener, removeListener },
      geometry: { encoding: { decodePath } },
      marker: { AdvancedMarkerElement: MockAdvancedMarkerElement },
    },
  } as unknown as typeof globalThis & { google: typeof google };
};

export const resetGoogleMapsMock = () => {
  MockMap.instances = [];
  MockInfoWindow.instances = [];
  MockAdvancedMarkerElement.instances = [];
  MockPolyline.instances = [];
  decodePath.mockClear();
};
