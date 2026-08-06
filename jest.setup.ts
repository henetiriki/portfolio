import '@testing-library/jest-dom';

class ResizeObserverMock {
  disconnect() {}
  observe() {}
  unobserve() {}
}

global.ResizeObserver = ResizeObserverMock;
