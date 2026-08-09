import { MantineProvider } from '@mantine/core';
import { renderToString } from 'react-dom/server';
import Contact from '@pages/contact';
import { theme } from '@styles';
import { render, screen } from '@utils/test/render';

describe('Contact page', () => {
  it('renders the page heading and contact form', () => {
    render(<Contact />);

    expect(
      screen.getByRole('heading', { level: 1, name: /get in touch/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Message/)).toBeInTheDocument();
  });

  it('renders the contact form during server rendering', () => {
    const html = renderToString(
      <MantineProvider forceColorScheme='dark' theme={theme}>
        <Contact />
      </MantineProvider>
    );

    expect(html).toContain('Your name');
    expect(html).toContain('Your email');
    expect(html).toContain('Your message');
  });
});
