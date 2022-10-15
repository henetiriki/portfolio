import { useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';
import { errorFromCode } from '@utils/contact';
import type { FormValues } from './types';

export const useFormikForm = (): {
  apiErrors: JSX.Element[];
  formik: any;
  submitted: boolean;
} => {
  const [submitted, setSubmitted] = useState(false);
  const [apiErrors, setApiErrors] = useState<JSX.Element[]>([]);

  const formik = useFormik<FormValues>({
    initialValues: {
      email: '',
      message: '',
      name: '',
    },
    onSubmit: async (values: FormValues, { resetForm }) => {
      setApiErrors([]);

      const response = await fetch('/api/contact', {
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (response.ok) {
        setSubmitted(true);
        resetForm({});

        return;
      }
      const { data } = await response.json();

      const errors: JSX.Element[] = [];

      data.forEach((code: string) => errors.push(errorFromCode(code)));

      setApiErrors(errors);
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .email('Please enter a valid email')
        .required('Please enter your email'),
      message: Yup.string().required('Please enter your message'),
      name: Yup.string().required('Please enter your name'),
    }),
  });

  return { apiErrors, formik, submitted };
};
