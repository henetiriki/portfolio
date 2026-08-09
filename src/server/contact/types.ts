export type ErrorType =
  | 'e_contains_url'
  | 'e_email_invalid'
  | 'e_email_required'
  | 'e_message_disallowed_chars'
  | 'e_message_required'
  | 'e_name_disallowed_chars'
  | 'e_name_required'
  | 'e_spam';

export type ContactApiErrorCode = ErrorType | 'e_generic';

export type ContactApiErrorResponse = {
  data: ContactApiErrorCode[];
};

export type ContactApiResponse =
  ContactApiErrorResponse | ContactApiSuccessResponse;

export type ContactApiSuccessResponse = {
  data: 'Sent successfully';
};

export type SendResponse = {
  error?: Error;
  success: boolean;
};

export type Submission = {
  email: string;
  heuning?: string;
  message: string;
  name: string;
};
