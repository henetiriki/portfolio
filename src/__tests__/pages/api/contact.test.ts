import handler from '@pages/api/contact';
import { send } from '@server/contact/send';
import { createMockApiContext } from '@utils/test/apiContext';
import type { Submission } from '@server/contact';

jest.mock('../../../server/contact/send', () => ({ send: jest.fn() }));

const validSubmission: Submission = {
  email: 'jane@example.com',
  message: 'Hello there!',
  name: 'Jane',
};

describe('contact API handler', () => {
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
    expect(console.error).toHaveBeenCalledWith('Contact email delivery failed');
    expect(JSON.stringify(json.mock.calls)).not.toContain('smtp down');
  });

  it('returns the same stable public error when the confirmation copy fails', async () => {
    (send as jest.Mock)
      .mockResolvedValueOnce({ success: true })
      .mockRejectedValueOnce({
        error: new Error('copy failed'),
        success: false,
      });

    const { json, req, res, status } = createMockApiContext(validSubmission);

    await handler(req, res);

    expect(send).toHaveBeenCalledTimes(2);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ data: ['e_generic'] });
    expect(JSON.stringify(json.mock.calls)).not.toContain('copy failed');
  });

  it('responds 200 once both the owner email and confirmation copy send successfully', async () => {
    (send as jest.Mock).mockResolvedValue({ success: true });

    const { json, req, res, status } = createMockApiContext(validSubmission);

    await handler(req, res);

    expect(send).toHaveBeenCalledTimes(2);
    expect(send).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ to: 'owner@example.test' })
    );
    expect(send).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ to: 'Jane <jane@example.com>' })
    );
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: 'Sent successfully' });
  });
});
