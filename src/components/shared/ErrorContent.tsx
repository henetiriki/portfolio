import { Button, Container, Space, Text, Title } from '@mantine/core';
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
        <Space h='xl' />
        <Text>
          <Button
            color='shamrock'
            leftIcon={<IconHandFinger size={21} style={{ rotate: '90deg' }} />}
            onClick={() => router.push('/')}
            radius='lg'
            size='lg'
            variant='outline'
            w={{ base: '100%', md: '25%', sm: '35%' }}>
            Shamrock button
          </Button>
        </Text>
      </Container>
    </Content>
  );
};
