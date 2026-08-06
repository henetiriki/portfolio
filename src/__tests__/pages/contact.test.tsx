import Contact from '@pages/contact';
import { render, screen } from '@utils/test/render';

describe('Contact page', () => {
  it('renders the page heading and, once loaded, the contact form', async () => {
    render(<Contact />);

    expect(
      screen.getByRole('heading', { level: 1, name: /get in touch/i })
    ).toBeInTheDocument();

    // DynamicContactForm is a next/dynamic (ssr: false) component that
    // resolves asynchronously
    expect(await screen.findByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Message/)).toBeInTheDocument();
  });
});
