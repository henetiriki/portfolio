import {
  Button,
  Container,
  Input,
  Loading,
  Row,
  Text,
  Textarea,
} from '@nextui-org/react';
import { FC, PropsWithoutRef } from 'react';
import { FormValueKey, useFormikForm } from '@hooks';
import {
  formContainer,
  formInput,
  formTextArea,
  submitButton,
  topRow,
} from '@styles';
import { upperFirst } from '@utils';

export const ContactForm: FC = () => {
  const {
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    touched,
    values,
  } = useFormikForm();

  const sharedProps: PropsWithoutRef<any> = {
    bordered: true,
    helperColor: 'error',
    onBlur: handleBlur,
    onChange: handleChange,
    size: 'lg',
  };

  return (
    <Container css={formContainer}>
      <Text h2>Send a message</Text>
      <form onSubmit={handleSubmit}>
        <Row css={topRow}>
          {(['name', 'email'] as FormValueKey[]).map(
            (field: FormValueKey, idx: number) => (
              <Input
                css={formInput}
                helperText={
                  touched[field] && errors[field] ? errors[field] : undefined
                }
                key={idx}
                labelPlaceholder={upperFirst(field)}
                name={field}
                status={
                  touched[field] && Boolean(errors[field]) ? 'error' : 'default'
                }
                value={values[field]}
                {...sharedProps}
              />
            )
          )}
        </Row>
        <Row>
          <Textarea
            css={formTextArea}
            helperText={
              touched.message && errors.message ? errors.message : undefined
            }
            labelPlaceholder='Message'
            name='message'
            status={
              touched.message && Boolean(errors.message) ? 'error' : 'default'
            }
            value={values.message}
            {...sharedProps}
          />
        </Row>
        <Input
          css={{ display: 'none' }}
          name='heuning'
          onBlur={handleBlur}
          onChange={handleChange}
        />
        <Row>
          <Button
            bordered
            color='success'
            css={submitButton}
            size='lg'
            type='submit'>
            {isSubmitting && (
              <Loading color='currentColor' size='sm' type='points' />
            )}
            {!isSubmitting && <>Send message</>}
          </Button>
        </Row>
      </form>
    </Container>
  );
};
