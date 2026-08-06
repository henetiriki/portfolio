import userEvent from '@testing-library/user-event';
import { NavigationLink } from '@components/nav/NavigationLink';
import { render, screen } from '@utils/test/render';

describe('NavigationLink', () => {
  it('renders the link text and href', () => {
    render(
      <NavigationLink href='/travel' onClickCb={jest.fn()} pathname='/'>
        Travel
      </NavigationLink>
    );

    expect(screen.getByRole('link', { name: 'Travel' })).toHaveAttribute(
      'href',
      '/travel'
    );
  });

  it('marks itself active when pathname matches href', () => {
    render(
      <NavigationLink href='/travel' onClickCb={jest.fn()} pathname='/travel'>
        Travel
      </NavigationLink>
    );

    expect(screen.getByRole('link', { name: 'Travel' })).toHaveClass('active');
  });

  it('does not mark itself active when pathname differs', () => {
    render(
      <NavigationLink href='/travel' onClickCb={jest.fn()} pathname='/'>
        Travel
      </NavigationLink>
    );

    expect(screen.getByRole('link', { name: 'Travel' })).not.toHaveClass(
      'active'
    );
  });

  it('calls onClickCb when clicked', async () => {
    const onClickCb = jest.fn();

    render(
      <NavigationLink href='/travel' onClickCb={onClickCb} pathname='/'>
        Travel
      </NavigationLink>
    );
    await userEvent.click(screen.getByRole('link', { name: 'Travel' }));

    expect(onClickCb).toHaveBeenCalledTimes(1);
  });
});
