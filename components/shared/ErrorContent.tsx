import { faHandPointRight } from '@fortawesome/free-solid-svg-icons';
import { Button, Container, Spacer, Text } from '@nextui-org/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Content } from '@components/content';
import type { FC } from 'react';

const DynamicFontAwesomeIcon = dynamic(
  () =>
    import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon),
  {
    ssr: false,
  }
);

export const ErrorContent: FC<{ errorHeading: string; message: string }> = ({
  errorHeading,
  message,
}) => {
  const router = useRouter();

  return (
    <Content>
      <Container>
        <Text h2>{errorHeading}</Text>
        <Text>{message}</Text>
        <Spacer y={3} />
        <Text css={{ ai: 'center', d: 'flex', gap: '$xl' }}>
          <DynamicFontAwesomeIcon
            height={30}
            icon={faHandPointRight}
            width={30}
          />
          <Button bordered color='success' onClick={() => router.push('/')}>
            Shamrock button
          </Button>
        </Text>
      </Container>
    </Content>
  );
};
