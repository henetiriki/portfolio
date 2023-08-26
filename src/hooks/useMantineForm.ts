import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { useState } from 'react';
import { genericError } from '@fixtures/contact';
import { errorFromCode } from '@utils/contact';
import type { FormValues } from './types';
import type { UseFormReturnType } from '@mantine/form';
import type { JSX } from 'react';

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

      const { data } = await response.json();

      const errors: JSX.Element[] = [];

      data.forEach((code: string) => errors.push(errorFromCode(code)));

      setApiErrors(errors);
    } catch (error: unknown) {
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
