import ErrorBoundary from '@components/shared/ErrorBoundary';
import { render, screen } from '@utils/test/render';

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
});
