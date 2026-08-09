import {
  Button,
  Flex,
  Space,
  TextInput,
  Textarea,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAt, IconMessage, IconSend, IconTag } from '@tabler/icons-react';
import { useEffect, useMemo } from 'react';
import { useMantineForm } from '@hooks';
import { CONTACT_FIELD_LIMITS } from '@utils/contactLimits';
import classes from './ContactForm.module.css';
import type { NotificationData } from '@mantine/notifications';
import type { FC } from 'react';

export const ContactForm: FC = () => {
  const {
    colors: { ['black-russian']: blackRussian },
  } = useMantineTheme();
  const {
    apiErrors,
    form: { getInputProps, onSubmit },
    isSubmitted,
    isSubmitting,
    submitForm,
  } = useMantineForm();
  const defaultNotificationProps: Omit<NotificationData, 'message'> = useMemo(
    () => ({
      autoClose: 6000,
      style: { backgroundColor: blackRussian[6] },
      withBorder: true,
    }),
    [blackRussian]
  );

  useEffect(() => {
    apiErrors.map(apiError => {
      notifications.show({
        ...defaultNotificationProps,
        color: 'torch-red',
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
      <Title order={2}>Send a message</Title>
      <Space h='md' />
      <form onSubmit={onSubmit(submitForm)}>
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          gap='xl'
          justify='space-evenly'>
          <TextInput
            classNames={classes}
            label='Name'
            leftSection={<IconTag size='0.75rem' />}
            maxLength={CONTACT_FIELD_LIMITS.name}
            mih={110}
            placeholder='Your name'
            radius='lg'
            size='lg'
            w='100%'
            withAsterisk
            {...getInputProps('name')}
          />
          <TextInput
            classNames={classes}
            label='Email'
            leftSection={<IconAt size='0.75rem' />}
            maxLength={CONTACT_FIELD_LIMITS.email}
            mih={110}
            placeholder='Your email'
            radius='lg'
            size='lg'
            type='email'
            w='100%'
            withAsterisk
            {...getInputProps('email')}
          />
        </Flex>
        <Space h='xl' />
        <Textarea
          autosize
          classNames={classes}
          label='Message'
          leftSection={<IconMessage size='0.75rem' />}
          maxLength={CONTACT_FIELD_LIMITS.message}
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
          color='shamrock.4'
          leftSection={<IconSend size={21} />}
          loading={isSubmitting}
          radius='lg'
          size='lg'
          type='submit'
          variant='outline'
          w={{ base: '100%', md: '25%', sm: '35%' }}>
          {isSubmitting ? 'Sending' : 'Send'}
        </Button>
        <TextInput
          aria-hidden
          autoComplete='off'
          display='none'
          name='heuning'
          tabIndex={-1}
          {...getInputProps('heuning')}
        />
      </form>
    </>
  );
};
