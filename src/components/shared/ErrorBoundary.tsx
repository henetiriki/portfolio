import { Button, Flex, Title } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { Component } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';

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

  componentDidCatch(error: Error) {
    // A fixed diagnostic, not the raw error/errorInfo: this boundary also
    // wraps MapWrapper, and a Google Maps SDK failure's message can embed a
    // request URL carrying the API key — see docs/travel-feature.md#loading-placeholder
    console.error('Component tree crashed:', error.name);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <Flex
            align='center'
            direction='column'
            gap='md'
            h='100vh'
            justify='center'
            px='md'
            w='100vw'>
            <Title order={4}>Oops, something went wrong!</Title>
            <Button
              color='shamrock.4'
              leftSection={<IconRefresh size={21} />}
              onClick={() => window.location.reload()}
              radius='lg'
              size='lg'
              variant='outline'
              w={{ base: '100%', md: '25%', sm: '35%' }}>
              Reload page
            </Button>
          </Flex>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
