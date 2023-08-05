import { Title } from '@mantine/core';
import { Component } from 'react';
import type { ErrorInfo, PropsWithChildren } from 'react';

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
          <Title order={4}>Oops, something went wrong!</Title>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}

export default ErrorBoundary;
