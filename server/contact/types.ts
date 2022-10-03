export type ErrorType =
  | 'e_contains_url'
  | 'e_email_invalid'
  | 'e_email_required'
  | 'e_message_disallowed_chars'
  | 'e_message_required'
  | 'e_name_disallowed_chars'
  | 'e_name_required'
  | 'e_spam';

export type SendResponse = {
  error?: Error;
  success: boolean;
};
