import { errorMessages, genericError } from '@fixtures/contact';
import { errorFromCode } from '@utils/contact';

describe('errorFromCode', () => {
  it('returns the matching message for a known error code', () => {
    const [{ code, message }] = errorMessages;

    expect(errorFromCode(code)).toBe(message);
  });

  it('falls back to the generic error for an unknown code', () => {
    expect(errorFromCode('not-a-real-code')).toBe(genericError);
  });
});
