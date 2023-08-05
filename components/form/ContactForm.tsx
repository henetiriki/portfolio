import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useFormikForm } from '@hooks';

import type { FC, JSX } from 'react';
import 'react-toastify/dist/ReactToastify.css';

export const ContactForm: FC = () => {
  const {
    apiErrors,
    formik: {},
    submitted,
  } = useFormikForm();

  useEffect(() => {
    toast.dismiss();

    if (apiErrors.length) {
      const errorContent = (
        <ul>
          {apiErrors.map((error: JSX.Element, idx: number) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
      );

      toast.error(errorContent, {
        autoClose: 10000,
      });
    }

    if (submitted) {
      toast.success('Thanks, your message has been sent');
    }
  }, [apiErrors, submitted]);

  return (
    <>
      <ToastContainer autoClose={5000} position='bottom-center' theme='dark' />
      <div>TODO</div>
      {/*<Container css={formContainer}>*/}
      {/*  <Text h2>Send a message</Text>*/}
      {/*  <Spacer y={2} />*/}
      {/*  <form onSubmit={handleSubmit}>*/}
      {/*    <Row css={topRow}>*/}
      {/*      {(['name', 'email'] as FormValueKey[]).map(*/}
      {/*        (field: FormValueKey, idx: number) => (*/}
      {/*          <Input*/}
      {/*            css={formInput}*/}
      {/*            helperText={*/}
      {/*              touched[field] && errors[field] ? errors[field] : undefined*/}
      {/*            }*/}
      {/*            key={idx}*/}
      {/*            labelPlaceholder={upperFirst(field)}*/}
      {/*            name={field}*/}
      {/*            status={*/}
      {/*              touched[field] && Boolean(errors[field])*/}
      {/*                ? 'error'*/}
      {/*                : 'default'*/}
      {/*            }*/}
      {/*            type={field === 'email' ? 'email' : 'text'}*/}
      {/*            value={values[field]}*/}
      {/*            {...sharedProps}*/}
      {/*          />*/}
      {/*        )*/}
      {/*      )}*/}
      {/*    </Row>*/}
      {/*    <Row>*/}
      {/*      <Textarea*/}
      {/*        css={formTextArea}*/}
      {/*        helperText={*/}
      {/*          touched.message && errors.message ? errors.message : undefined*/}
      {/*        }*/}
      {/*        labelPlaceholder='Message'*/}
      {/*        minRows={5}*/}
      {/*        name='message'*/}
      {/*        readOnly={submitted}*/}
      {/*        status={*/}
      {/*          touched.message && Boolean(errors.message) ? 'error' : 'default'*/}
      {/*        }*/}
      {/*        value={values.message}*/}
      {/*        {...sharedProps}*/}
      {/*      />*/}
      {/*    </Row>*/}
      {/*    <Input*/}
      {/*      css={{ display: 'none' }}*/}
      {/*      name='heuning'*/}
      {/*      onBlur={handleBlur}*/}
      {/*      onChange={handleChange}*/}
      {/*    />*/}
      {/*    <Row>*/}
      {/*      <Button*/}
      {/*        bordered*/}
      {/*        color='success'*/}
      {/*        css={submitButton}*/}
      {/*        disabled={submitted}*/}
      {/*        icon={*/}
      {/*          submitted ? (*/}
      {/*            <FontAwesomeIcon*/}
      {/*              color='$white'*/}
      {/*              height={20}*/}
      {/*              icon={faCheck}*/}
      {/*              width={20}*/}
      {/*            />*/}
      {/*          ) : undefined*/}
      {/*        }*/}
      {/*        size='lg'*/}
      {/*        type='submit'>*/}
      {/*        {!submitted && isSubmitting && (*/}
      {/*          <Loading color='currentColor' size='sm' type='points' />*/}
      {/*        )}*/}
      {/*        {!submitted && !isSubmitting && <>Send message</>}*/}
      {/*        {submitted && <>Message sent</>}*/}
      {/*      </Button>*/}
      {/*    </Row>*/}
      {/*  </form>*/}
      {/*</Container>*/}
    </>
  );
};
