import { errorMessages, genericError } from '@fixtures/form';
import { ErrorMessage } from '@fixtures/types';

export const errorFromCode = (code: string): JSX.Element =>
  errorMessages.find((message: ErrorMessage) => message.code === code)
    ?.message || genericError;
