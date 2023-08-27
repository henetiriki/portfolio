import {
  Button,
  Flex,
  Space,
  TextInput,
  Textarea,
  Title,
  createStyles,
  useMantineTheme,
} from '@mantine/core';
import { Notifications, notifications } from '@mantine/notifications';
import { IconAt, IconMessage, IconSend, IconTag } from '@tabler/icons-react';
import { useEffect, useMemo } from 'react';
import { useMantineForm } from '@hooks';
import type { MantineTheme } from '@mantine/core';
import type { NotificationProps } from '@mantine/notifications';
import type { FC } from 'react';

const useStyles = createStyles(
  ({ colors: { whisper }, spacing: { xs }, white }: MantineTheme) => ({
    input: {
      '&:focus-within': {
        borderColor: white,
      },
      backgroundColor: 'transparent',
      borderColor: whisper,
    },
    label: {
      marginBottom: xs,
    },
  })
);

export const ContactForm: FC = () => {
  const {
    classes: { input, label },
  } = useStyles();
  const {
    colors: { blackRussian },
  } = useMantineTheme();
  const {
    apiErrors,
    form: { getInputProps, onSubmit },
    isSubmitted,
    isSubmitting,
    submitForm,
  } = useMantineForm();
  const defaultNotificationProps: Omit<NotificationProps, 'message'> = useMemo(
    () => ({
      autoClose: 6000,
      sx: { backgroundColor: blackRussian[6] },
      withBorder: true,
    }),
    [blackRussian]
  );

  useEffect(() => {
    apiErrors.map(apiError => {
      notifications.show({
        ...defaultNotificationProps,
        color: 'torchRed',
        message: apiError,
        title: 'Oops!',
      });
    });
  }, [apiErrors, blackRussian, defaultNotificationProps]);

  useEffect(() => {
    if (isSubmitted) {
      notifications.show({
        ...defaultNotificationProps,
        color: 'shamrock',
        message: 'Your message has been sent',
        title: 'Thanks!',
      });
    }
  }, [blackRussian, defaultNotificationProps, isSubmitted]);

  return (
    <>
      <Notifications position='bottom-center' />
      <Title order={2}>Send a message</Title>
      <Space h='md' />
      <form onSubmit={onSubmit(submitForm)}>
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          gap='xl'
          justify='space-evenly'>
          <TextInput
            classNames={{ input, label }}
            icon={<IconTag size='0.75rem' />}
            label='Name'
            mih={110}
            placeholder='Your name'
            radius='lg'
            size='lg'
            w='100% '
            withAsterisk
            {...getInputProps('name')}
          />
          <TextInput
            classNames={{ input, label }}
            icon={<IconAt size='0.75rem' />}
            label='Email'
            mih={110}
            placeholder='Your email'
            radius='lg'
            size='lg'
            type='email'
            w='100% '
            withAsterisk
            {...getInputProps('email')}
          />
        </Flex>
        <Space h='xl' />
        <Textarea
          classNames={{ input, label }}
          icon={<IconMessage size='0.75rem' />}
          label='Message'
          mih={180}
          minRows={4}
          placeholder='Your message'
          radius='lg'
          size='lg'
          variant='filled'
          withAsterisk
          {...getInputProps('message')}
        />
        <Space h='xl' />
        <Button
          color='shamrock'
          leftIcon={<IconSend size={21} />}
          loading={isSubmitting}
          radius='lg'
          size='lg'
          type='submit'
          variant='outline'
          w={{ base: '100%', md: '25%', sm: '35%' }}>
          {isSubmitting ? 'Sending' : 'Send'}
        </Button>
        <TextInput name='heuning' sx={{ display: 'none' }} />
      </form>
    </>
  );
};
