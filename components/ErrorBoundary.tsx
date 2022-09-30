import { Component, ErrorInfo, PropsWithChildren } from 'react';

class ErrorBoundary extends Component {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log({
      error,
      errorInfo,
    });
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div>
          <h2>Oops, something went wrong!</h2>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}

export default ErrorBoundary;
