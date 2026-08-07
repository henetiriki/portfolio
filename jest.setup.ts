import '@testing-library/jest-dom';

class ResizeObserverMock {
  disconnect() {}
  observe() {}
  unobserve() {}
}

global.ResizeObserver = ResizeObserverMock;

// jsdom doesn't implement scrollIntoView; guarded since some test files
// (e.g. those with `@jest-environment node`) have no Element global at all
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = jest.fn();
}

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});
