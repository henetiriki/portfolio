import { useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';
import { FormValues } from './types';

export const useFormikForm = (): { formik: any; submitted: boolean } => {
  const [submitted, setSubmitted] = useState(false);

  const formik = useFormik<FormValues>({
    initialValues: {
      email: '',
      message: '',
      name: '',
    },
    onSubmit: async (values: FormValues) => {
      const response = await fetch('/api/contact', {
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (response.ok) {
        setSubmitted(true);

        return;
      }

      console.log(await response.text());
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .email('Please enter a valid email')
        .required('Please enter your email'),
      message: Yup.string().required('Please enter your message'),
      name: Yup.string().required('Please enter your name'),
    }),
  });

  return { formik, submitted };
};
