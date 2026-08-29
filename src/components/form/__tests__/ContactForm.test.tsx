import userEvent from '@testing-library/user-event';
import { ContactForm } from '@components/form/ContactForm';
import { CONTACT_FIELD_LIMITS } from '@utils/contactLimits';
import { render, screen, waitFor } from '@utils/test/render';

describe('ContactForm', () => {
  it('renders the name, email and message fields plus a send button', () => {
    const { container } = render(<ContactForm />);

    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Message/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    const secondaryField = container.querySelector('input[name="heuning"]');

    expect(secondaryField?.closest('.mantine-TextInput-root')).toHaveStyle({
      display: 'none',
    });
    expect(secondaryField).toHaveAttribute('tabindex', '-1');
    expect(screen.getByLabelText(/^Name/)).toHaveAttribute(
      'maxlength',
      `${CONTACT_FIELD_LIMITS.name}`
    );
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute(
      'maxlength',
      `${CONTACT_FIELD_LIMITS.email}`
    );
    expect(screen.getByLabelText(/^Message/)).toHaveAttribute(
      'maxlength',
      `${CONTACT_FIELD_LIMITS.message}`
    );
  });

  it('shows inline validation errors and never calls fetch when required fields are empty', async () => {
    global.fetch = jest.fn();

    render(<ContactForm />);
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(
      await screen.findByText('Please enter your name')
    ).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    expect(screen.getByText('Please enter your message')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Name/)).toHaveAttribute(
      'data-error',
      'true'
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows a success notification and resets the form after a successful submission', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    render(<ContactForm />);
    await userEvent.type(screen.getByLabelText(/^Name/), 'Jane');
    await userEvent.type(screen.getByLabelText(/^Email/), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/^Message/), 'Hello there!');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(
      await screen.findByText('Your message has been sent')
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Name/)).toHaveValue('');
  });

  it('shows an error notification when the API returns a validation error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ data: ['e_spam'] }),
      ok: false,
    });

    render(<ContactForm />);
    await userEvent.type(screen.getByLabelText(/^Name/), 'Jane');
    await userEvent.type(screen.getByLabelText(/^Email/), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/^Message/), 'Hello there!');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(
      await screen.findByText('The spam filter has been triggered')
    ).toBeInTheDocument();
  });

  it('falls back to a generic error when the API response is malformed', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ data: 'unexpected' }),
      ok: false,
    });

    render(<ContactForm />);
    await userEvent.type(screen.getByLabelText(/^Name/), 'Jane');
    await userEvent.type(screen.getByLabelText(/^Email/), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/^Message/), 'Hello there!');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(
      await screen.findByText(
        'Something unexpected happened — please try again later...'
      )
    ).toBeInTheDocument();
  });

  it('shows the "Sending" label while the request is in flight', async () => {
    let resolveFetch: (value: { ok: boolean }) => void = () => {};

    global.fetch = jest.fn(
      () =>
        new Promise(resolve => {
          resolveFetch = resolve;
        })
    ) as jest.Mock;

    render(<ContactForm />);
    await userEvent.type(screen.getByLabelText(/^Name/), 'Jane');
    await userEvent.type(screen.getByLabelText(/^Email/), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/^Message/), 'Hello there!');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(
      await screen.findByRole('button', { name: 'Sending' })
    ).toBeInTheDocument();

    await waitFor(() => resolveFetch({ ok: true }));
  });
});
