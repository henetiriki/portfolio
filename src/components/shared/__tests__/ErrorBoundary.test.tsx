import { MantineProvider } from '@mantine/core';
import {
  render as rtlRender,
  screen as rtlScreen,
} from '@testing-library/react';
import ErrorBoundary from '@components/shared/ErrorBoundary';
import { theme } from '@styles';
import { fireEvent, render, screen } from '@utils/test/render';

const ProblemChild = () => {
  throw new Error('boom');
};

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>All good</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders a fallback message when a child throws', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops, something went wrong!')).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('logs a fixed diagnostic rather than the raw error, since this boundary also wraps content that can throw errors carrying sensitive URLs', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(consoleError).toHaveBeenCalledWith(
      'Component tree crashed:',
      'Error'
    );
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.anything() })
    );

    consoleError.mockRestore();
  });

  it('renders a reload button in the default fallback and clicking it does not throw', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Reload page' }))
    ).not.toThrow();

    consoleError.mockRestore();
  });

  it('renders a caller-supplied fallback instead of the default message', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    expect(
      screen.queryByText('Oops, something went wrong!')
    ).not.toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('renders its fallback correctly when nested inside MantineProvider, as _app.tsx composes it', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    rtlRender(
      <MantineProvider theme={theme}>
        <ErrorBoundary>
          <ProblemChild />
        </ErrorBoundary>
      </MantineProvider>
    );

    expect(
      rtlScreen.getByText('Oops, something went wrong!')
    ).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
