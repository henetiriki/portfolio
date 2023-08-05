import { faHandPointRight } from '@fortawesome/free-solid-svg-icons';
import { Button, Container, Text, Title } from '@mantine/core';
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
        <Title order={2}>{errorHeading}</Title>
        <Text>{message}</Text>
        <Text>
          <DynamicFontAwesomeIcon
            height={30}
            icon={faHandPointRight}
            width={30}
          />
          <Button onClick={() => router.push('/')}>Shamrock button</Button>
        </Text>
      </Container>
    </Content>
  );
};
