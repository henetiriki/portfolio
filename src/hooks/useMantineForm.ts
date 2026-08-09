import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { useState } from 'react';
import { genericError } from '@fixtures/contact';
import { errorFromCode } from '@utils/contact';
import type { FormValues } from './types';
import type { UseFormReturnType } from '@mantine/form';
import type { JSX } from 'react';

const isErrorPayload = (value: unknown): value is { data: string[] } => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const { data } = value as { data?: unknown };

  return Array.isArray(data) && data.every(code => typeof code === 'string');
};

export const useMantineForm = (): {
  apiErrors: JSX.Element[];
  form: UseFormReturnType<FormValues>;
  isSubmitted: boolean;
  isSubmitting: boolean;
  submitForm: (values: FormValues) => Promise<void>;
} => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiErrors, setApiErrors] = useState<JSX.Element[]>([]);

  const form: UseFormReturnType<FormValues> = useForm<FormValues>({
    initialValues: {
      email: '',
      message: '',
      name: '',
    },
    validate: {
      email: isEmail('Please enter a valid email'),
      message: isNotEmpty('Please enter your message'),
      name: isNotEmpty('Please enter your name'),
    },
    validateInputOnBlur: true,
  });

  const submitForm = async (values: FormValues) => {
    setIsSubmitting(true);
    setApiErrors([]);

    try {
      const response = await fetch('/api/contact', {
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (response.ok) {
        setIsSubmitted(true);
        form.reset();

        return;
      }

      const payload: unknown = await response.json();

      if (!isErrorPayload(payload)) {
        throw new Error('Invalid contact API response');
      }

      setApiErrors(payload.data.map(errorFromCode));
    } catch {
      setApiErrors([genericError]);
    } finally {
      setIsSubmitting(false);

      setTimeout(() => {
        setIsSubmitted(false);
        setApiErrors([]);
      }, 250);
    }
  };

  return {
    apiErrors,
    form,
    isSubmitted,
    isSubmitting,
    submitForm,
  };
};
