import handler from '@pages/api/contact';
import {
  createContactTransporter,
  isContactRequestAllowed,
  send,
} from '@server/contact/send';
import { CONTACT_FIELD_LIMITS } from '@utils/contactLimits';
import { createMockApiContext } from '@utils/test/apiContext';
import type { Submission } from '@server/contact';

jest.mock('../../../server/contact/send', () => ({
  createContactTransporter: jest.fn(),
  isContactRequestAllowed: jest.fn(),
  send: jest.fn(),
}));

const validSubmission: Submission = {
  email: 'jane@example.com',
  message: 'Hello there!',
  name: 'Jane',
};
const transporter = { sendMail: jest.fn() };

describe('contact API handler', () => {
  beforeEach(() => {
    (createContactTransporter as jest.Mock).mockReturnValue(transporter);
    (isContactRequestAllowed as jest.Mock).mockResolvedValue(true);
    (send as jest.Mock).mockResolvedValue({ success: true });
  });

  it('rejects unsupported methods without validating or sending', async () => {
    const { json, req, res, setHeader, status } = createMockApiContext(
      validSubmission,
      { method: 'GET' }
    );

    await handler(req, res);

    expect(setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(status).toHaveBeenCalledWith(405);
    expect(json).toHaveBeenCalledWith({ data: ['e_generic'] });
    expect(send).not.toHaveBeenCalled();
  });

  it.each([
    undefined,
    null,
    [],
    'not an object',
    { email: 'jane@example.com', name: 'Jane' },
    { ...validSubmission, email: 123 },
    { ...validSubmission, heuning: 123 },
  ])('rejects a malformed request body', async body => {
    const { json, req, res, status } = createMockApiContext(body);

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ data: ['e_generic'] });
    expect(send).not.toHaveBeenCalled();
  });

  it('responds 400 with validation errors and never calls send', async () => {
    const { json, req, res, status } = createMockApiContext({
      ...validSubmission,
      name: '',
    });

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ data: ['e_name_required'] });
    expect(send).not.toHaveBeenCalled();
  });

  it('passes the secondary form signal through server validation', async () => {
    const { json, req, res, status } = createMockApiContext({
      ...validSubmission,
      heuning: 'present',
    });

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ data: ['e_spam'] });
    expect(isContactRequestAllowed).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it.each(Object.entries(CONTACT_FIELD_LIMITS))(
    'rejects an oversized %s with the generic public error',
    async (field, limit) => {
      const { json, req, res, status } = createMockApiContext({
        ...validSubmission,
        [field]: 'x'.repeat(limit + 1),
      });

      await handler(req, res);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({ data: ['e_generic'] });
      expect(isContactRequestAllowed).not.toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
    }
  );

  it('rejects a request that fails request verification before creating a transport', async () => {
    (isContactRequestAllowed as jest.Mock).mockResolvedValue(false);

    const { json, req, res, status } = createMockApiContext(validSubmission);

    await handler(req, res);

    expect(isContactRequestAllowed).toHaveBeenCalledTimes(1);
    expect(createContactTransporter).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ data: ['e_generic'] });
    expect(console.warn).toHaveBeenCalledWith('Contact message rejected');
  });

  it('returns a stable public error when request verification fails', async () => {
    (isContactRequestAllowed as jest.Mock).mockRejectedValue(
      new Error('verification unavailable')
    );

    const { json, req, res, status } = createMockApiContext(validSubmission);

    await handler(req, res);

    expect(createContactTransporter).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ data: ['e_generic'] });
    expect(console.error).toHaveBeenCalledWith(
      'Contact request verification failed'
    );
    expect(
      JSON.stringify((console.error as jest.Mock).mock.calls)
    ).not.toContain('verification unavailable');
  });

  it('returns a stable public error when the owner email fails to send', async () => {
    (send as jest.Mock).mockRejectedValueOnce({
      error: new Error('smtp down'),
      success: false,
    });

    const { json, req, res, status } = createMockApiContext(validSubmission);

    await handler(req, res);

    expect(send).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ data: ['e_generic'] });
    expect(isContactRequestAllowed).toHaveBeenCalledTimes(1);
    expect(createContactTransporter).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      'Contact owner email delivery failed'
    );
    expect(JSON.stringify(json.mock.calls)).not.toContain('smtp down');
    expect(
      JSON.stringify((console.error as jest.Mock).mock.calls)
    ).not.toContain('smtp down');
  });

  it('treats a confirmation-copy failure as non-fatal after owner delivery', async () => {
    (send as jest.Mock)
      .mockResolvedValueOnce({ success: true })
      .mockRejectedValueOnce({
        error: new Error('copy failed'),
        success: false,
      });

    const { json, req, res, status } = createMockApiContext(validSubmission);

    await handler(req, res);

    expect(send).toHaveBeenCalledTimes(2);
    expect(send).toHaveBeenNthCalledWith(
      1,
      transporter,
      expect.objectContaining({ to: 'owner@example.test' })
    );
    expect(send).toHaveBeenNthCalledWith(
      2,
      transporter,
      expect.objectContaining({
        to: { address: 'jane@example.com', name: 'Jane' },
      })
    );
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: 'Sent successfully' });
    expect(console.warn).toHaveBeenCalledWith(
      'Contact confirmation email delivery failed'
    );
    expect(JSON.stringify(json.mock.calls)).not.toContain('copy failed');
    expect(
      JSON.stringify((console.warn as jest.Mock).mock.calls)
    ).not.toContain('copy failed');
  });

  it('responds 200 once both the owner email and confirmation copy send successfully', async () => {
    (send as jest.Mock).mockResolvedValue({ success: true });

    const { json, req, res, status } = createMockApiContext(validSubmission);

    await handler(req, res);

    expect(send).toHaveBeenCalledTimes(2);
    expect(send).toHaveBeenNthCalledWith(
      1,
      transporter,
      expect.objectContaining({ to: 'owner@example.test' })
    );
    expect(send).toHaveBeenNthCalledWith(
      2,
      transporter,
      expect.objectContaining({
        to: { address: 'jane@example.com', name: 'Jane' },
      })
    );
    expect(isContactRequestAllowed).toHaveBeenCalledTimes(1);
    expect(createContactTransporter).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: 'Sent successfully' });
  });
});
