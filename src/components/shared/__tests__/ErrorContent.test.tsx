import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { ErrorContent } from '@components/shared/ErrorContent';
import { render, screen } from '@utils/test/render';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

describe('ErrorContent', () => {
  it('renders the heading and message', () => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

    render(<ErrorContent errorHeading='Oops' message='Something broke' />);

    expect(screen.getByRole('heading', { name: 'Oops' })).toBeInTheDocument();
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });

  it('navigates home when the shamrock button is clicked', async () => {
    const push = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({ push });

    render(<ErrorContent errorHeading='Oops' message='Something broke' />);
    await userEvent.click(
      screen.getByRole('button', { name: /shamrock button/i })
    );

    expect(push).toHaveBeenCalledWith('/');
  });
});
