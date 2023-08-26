import { errorMessages, genericError } from '@fixtures/contact';
import type { ErrorMessage } from '@fixtures/types';
import type { JSX } from 'react';

export const errorFromCode = (code: string): JSX.Element =>
  errorMessages.find((message: ErrorMessage) => message.code === code)
    ?.message || genericError;
