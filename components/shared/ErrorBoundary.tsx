import { Container, Text } from '@nextui-org/react';
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
        <Container>
          <Text h4>Oops, something went wrong!</Text>
        </Container>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}

export default ErrorBoundary;
