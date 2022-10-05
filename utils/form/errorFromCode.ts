import { ErrorMessage, errorMessages, genericError } from '@fixtures/form';

export const errorFromCode = (code: string): JSX.Element =>
  errorMessages.find((message: ErrorMessage) => message.code === code)
    ?.message || genericError;
