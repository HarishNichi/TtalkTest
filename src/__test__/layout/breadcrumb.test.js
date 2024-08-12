import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Breadcrumb from '../../components/Layout/breadcrumb';

describe('Breadcrumb', () => {
  test('renders breadcrumb links correctly', () => {
    const links = [
      { title: 'Home', link: '/' },
      { title: 'name', link: '/web/test' },
    ];
    render(<Breadcrumb links={links} />);
    
    const homeLink = screen.getByText('Home');
    const nameLink = screen.getByText('name');

    expect(homeLink).toBeInTheDocument();
    expect(nameLink).toBeInTheDocument();
  });
});
