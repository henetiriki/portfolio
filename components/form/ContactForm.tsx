import {
  Button,
  Flex,
  Space,
  TextInput,
  Textarea,
  Title,
  createStyles,
  rem,
} from '@mantine/core';
import { Notifications, notifications } from '@mantine/notifications';
import { IconSend } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useMantineForm } from '@hooks';
import { upperFirst } from '@utils/common';
import type { FormValueKey } from '@hooks';
import type { MantineTheme } from '@mantine/core';
import type { FC } from 'react';

const useStyles = createStyles(
  ({ colors: { whisper, white }, spacing: { xs } }: MantineTheme) => ({
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
    apiErrors,
    form: { getInputProps, onSubmit },
    isSubmitted,
    isSubmitting,
    submitForm,
  } = useMantineForm();

  useEffect(() => {
    apiErrors.map(apiError => {
      notifications.show({
        autoClose: 6000,
        color: 'torchRed',
        message: apiError,
        title: 'Oops!',
      });
    });
  }, [apiErrors]);

  useEffect(() => {
    if (isSubmitted) {
      notifications.show({
        autoClose: 6000,
        color: 'shamrock',
        message: 'Your message has been sent',
        title: 'Thanks!',
      });
    }
  }, [isSubmitted]);

  return (
    <>
      <Notifications />
      <Title order={2}>Send a message</Title>
      <Space h='md' />
      <form onSubmit={onSubmit(submitForm)}>
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          gap='xl'
          justify='space-evenly'>
          {(['name', 'email'] as FormValueKey[]).map((field: FormValueKey) => (
            <TextInput
              classNames={{ input, label }}
              key={field}
              label={upperFirst(field)}
              mih={rem(95)}
              placeholder={`Your ${field}`}
              radius='lg'
              size='md'
              w='100% '
              withAsterisk
              {...getInputProps(field)}
            />
          ))}
        </Flex>
        <Space h='xl' />
        <Textarea
          classNames={{ input, label }}
          label='Message'
          mih={rem(118)}
          placeholder='Your message'
          radius='lg'
          size='md'
          variant='filled'
          withAsterisk
          {...getInputProps('message')}
        />
        <Space h='xl' />
        <Button
          color='shamrock'
          leftIcon={<IconSend size={rem(21)} />}
          loading={isSubmitting}
          radius='lg'
          size='md'
          type='submit'
          variant='outline'
          w={{ base: '100%', sm: 'auto' }}>
          Submit
        </Button>
        <TextInput name='heuning' sx={{ display: 'none' }} />
      </form>
    </>
  );
};
