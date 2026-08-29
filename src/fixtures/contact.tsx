import type { ErrorMessage } from '@fixtures/types';
import type { JSX } from 'react';

export const genericError: JSX.Element = (
  <>Something unexpected happened — please try again later...</>
);
const disallowedChars: JSX.Element = (
  <>
    contains one or more disallowed characters:{' '}
    <i>&lt; &gt; ^ | ” ’ % ; ( ) & + -</i>
  </>
);
const required: JSX.Element = <>Please enter your</>;

export const errorMessages: ErrorMessage[] = [
  {
    code: 'e_spam',
    message: <>The spam filter has been triggered</>,
  },
  {
    code: 'e_name_required',
    message: <>{required} name</>,
  },
  {
    code: 'e_name_disallowed_chars',
    message: <>Name {disallowedChars}</>,
  },
  {
    code: 'e_email_required',
    message: <>{required} email</>,
  },
  {
    code: 'e_email_invalid',
    message: <>You have entered an invalid email</>,
  },
  {
    code: 'e_message_required',
    message: <>{required} message</>,
  },
  {
    code: 'e_message_disallowed_chars',
    message: <>Message {disallowedChars}</>,
  },
  {
    code: 'e_contains_url',
    message: <>URLs are not allowed</>,
  },
  {
    code: 'e_generic',
    message: genericError,
  },
];
