import { faCheck, faExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Card,
  Container,
  Input,
  Loading,
  Row,
  Spacer,
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
    apiErrors,
    formik: {
      errors,
      handleBlur,
      handleChange,
      handleSubmit,
      isSubmitting,
      touched,
      values,
    },
    submitted,
  } = useFormikForm();

  const sharedProps: PropsWithoutRef<any> = {
    bordered: true,
    helperColor: 'error',
    onBlur: handleBlur,
    onChange: handleChange,
    readOnly: submitted,
    size: 'lg',
  };

  return (
    <Container css={formContainer}>
      <Text h2>Send a message</Text>
      <Spacer y={2} />
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
                type={field === 'email' ? 'email' : 'text'}
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
            readOnly={submitted}
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
            disabled={submitted}
            icon={
              submitted ? (
                <FontAwesomeIcon
                  color='$white'
                  height={20}
                  icon={faCheck}
                  width={20}
                />
              ) : undefined
            }
            size='lg'
            type='submit'>
            {!submitted && isSubmitting && (
              <Loading color='currentColor' size='sm' type='points' />
            )}
            {!submitted && !isSubmitting && <>Send message</>}
            {submitted && <>Message sent</>}
          </Button>
        </Row>
        <Row css={{ mt: '$2xl' }}>
          {submitted && (
            <Card
              css={{ bc: '$salem', borderColor: '$shamrock' }}
              variant='bordered'>
              <Card.Body>
                <Text css={{ mb: 0 }}>Thanks, your message has been sent</Text>
              </Card.Body>
            </Card>
          )}
          {apiErrors.length > 0 && (
            <Card
              css={{ bc: '$flame-red', borderColor: '$alizarin' }}
              variant='bordered'>
              <Card.Body>
                <ul>
                  {apiErrors.map((message: JSX.Element, idx: number) => (
                    <li key={idx}>
                      <FontAwesomeIcon
                        height={15}
                        icon={faExclamation}
                        width={15}
                      />{' '}
                      {message}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          )}
        </Row>
      </form>
    </Container>
  );
};
