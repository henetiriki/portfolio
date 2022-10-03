import {
  Button,
  Container,
  Input,
  Loading,
  Row,
  Text,
  Textarea,
} from '@nextui-org/react';
import { useFormik } from 'formik';
import { FC } from 'react';
import * as Yup from 'yup';

type FormValues = {
  email: string;
  heuning?: string;
  message: string;
  name: string;
};

export const ContactForm: FC = () => {
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
        console.log(await response.json());

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

  return (
    <Container
      css={{
        '@xs': {
          mw: '60%',
        },
      }}>
      <Text h2>Send a message</Text>
      <form onSubmit={formik.handleSubmit}>
        <Row
          css={{
            d: 'flex',
            fd: 'column',
            mt: '$2xl',
            /* eslint-disable sort-keys/sort-keys-fix */
            '@xs': {
              fd: 'row',
            },
            /* eslint-enable sort-keys/sort-keys-fix */
          }}>
          <Input
            bordered
            css={{
              mb: '$2xl',
              mt: '$md',
              width: '100%',
              /* eslint-disable sort-keys/sort-keys-fix */
              '@xs': {
                mw: '50%',
                mr: '$xs',
              },
              /* eslint-enable sort-keys/sort-keys-fix */
            }}
            helperColor='error'
            helperText={
              formik.touched.name && formik.errors.name
                ? formik.errors.name
                : undefined
            }
            labelPlaceholder='Name'
            name='name'
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            size='lg'
            status={
              formik.touched.name && Boolean(formik.errors.name)
                ? 'error'
                : 'default'
            }
            value={formik.values.name}
          />
          <Input
            bordered
            css={{
              mb: '$2xl',
              mt: '$md',
              width: '100%',
              /* eslint-disable sort-keys/sort-keys-fix */
              '@xs': {
                mw: '50%',
                ml: '$xs',
              },
              /* eslint-enable sort-keys/sort-keys-fix */
            }}
            helperColor='error'
            helperText={
              formik.touched.email && formik.errors.email
                ? formik.errors.email
                : undefined
            }
            labelPlaceholder='Email'
            name='email'
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            size='lg'
            status={
              formik.touched.email && Boolean(formik.errors.email)
                ? 'error'
                : 'default'
            }
            value={formik.values.email}
          />
        </Row>
        <Row>
          <Textarea
            bordered
            css={{ mb: '$2xl', mt: '$md', width: '100%' }}
            helperColor='error'
            helperText={
              formik.touched.message && formik.errors.message
                ? formik.errors.message
                : undefined
            }
            labelPlaceholder='Message'
            name='message'
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            size='lg'
            status={
              formik.touched.message && Boolean(formik.errors.message)
                ? 'error'
                : 'default'
            }
            value={formik.values.message}
          />
        </Row>
        <Input
          css={{ display: 'none' }}
          name='heuning'
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
        />
        <Row>
          <Button
            bordered
            color='success'
            css={{
              mt: '$md',
              px: '$13',
              w: '100%',
              /* eslint-disable sort-keys/sort-keys-fix */
              '@xs': {
                w: 'auto',
              },
              /* eslint-enable sort-keys/sort-keys-fix */
            }}
            size='lg'
            type='submit'>
            {formik.isSubmitting && (
              <Loading color='currentColor' size='sm' type='points' />
            )}
            {!formik.isSubmitting && <>Send message</>}
          </Button>
        </Row>
      </form>
    </Container>
  );
};
