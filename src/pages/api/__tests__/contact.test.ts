import handler from '@pages/api/contact';
import { send } from '@server/contact/send';
import { createMockApiContext } from '@utils/test/apiContext';
import type { Submission } from '@pages/api/types';

jest.mock('../../../server/contact/send', () => ({ send: jest.fn() }));

const validSubmission: Submission = {
  email: 'jane@example.com',
  message: 'Hello there!',
  name: 'Jane',
};

describe('contact API handler', () => {
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

  it('responds 500 with the error message when the owner email fails to send', async () => {
    (send as jest.Mock).mockRejectedValueOnce({
      error: new Error('smtp down'),
      success: false,
    });

    const { json, req, res, status } = createMockApiContext(validSubmission);

    await handler(req, res);

    expect(send).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ data: 'smtp down' });
  });

  it('falls back to "Unknown error" when the rejection has no error message', async () => {
    (send as jest.Mock).mockRejectedValueOnce({ success: false });

    const { json, req, res, status } = createMockApiContext(validSubmission);

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ data: 'Unknown error' });
  });

  it('responds 500 when the confirmation copy fails to send after the owner email succeeds', async () => {
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
    expect(json).toHaveBeenCalledWith({ data: 'copy failed' });
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
