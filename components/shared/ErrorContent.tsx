import { Button, Container, Text, Title, rem } from '@mantine/core';
import { IconHandFinger } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { Content } from '@components/content';
import type { FC } from 'react';

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
          <IconHandFinger size={rem(30)} style={{ rotate: '90deg' }} />
          <Button onClick={() => router.push('/')}>Shamrock button</Button>
        </Text>
      </Container>
    </Content>
  );
};
