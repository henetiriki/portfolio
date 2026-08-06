import { jobs, schools } from '@fixtures/experience';
import Experience from '@pages/experience';
import { render, screen } from '@utils/test/render';

describe('Experience page', () => {
  it('renders the page heading', () => {
    render(<Experience />);

    expect(
      screen.getByRole('heading', { level: 1, name: /experience/i })
    ).toBeInTheDocument();
  });

  it('renders every job and school title', () => {
    render(<Experience />);

    expect(screen.getByText('Work History')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(jobs.length).toBeGreaterThan(0);
    expect(schools.length).toBeGreaterThan(0);
  });
});
