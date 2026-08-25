import { Flex, Title } from '@mantine/core';
import { Component } from 'react';
import type { ErrorInfo, PropsWithChildren, ReactNode } from 'react';

type ErrorBoundaryProps = PropsWithChildren<{
  fallback?: ReactNode;
}>;

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
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
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <Flex align='center' h='100vh' justify='center' w='100vw'>
            <Title order={4}>Oops, something went wrong!</Title>
          </Flex>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
