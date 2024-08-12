import React from 'react';
import { render, screen } from '@testing-library/react';
import IconLeftBtn from '../../components/Button/iconLeftBtn';
import '@testing-library/jest-dom';

describe('IconLeftBtn', () => {
  test('renders button with icon and text', () => {
    const mockIcon = jest.fn(() => <svg>Mock Icon</svg>);
    const buttonText = 'Button Text';

    render(<IconLeftBtn icon={mockIcon} text={buttonText} textColor="text-white"/>);

    // Assert the button is rendered with the provided text and icon
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText(buttonText)).toBeInTheDocument();
    expect(screen.getByText('Mock Icon')).toBeInTheDocument();

    // Assert the button has the correct CSS classes applied
    expect(screen.getByRole('button')).toHaveClass('bg-customBlue');
    expect(screen.getByRole('button')).toHaveClass('hover:bg-grey');
    expect(screen.getByRole('button')).toHaveClass('text-white');
    expect(screen.getByRole('button')).toHaveClass('bg-customBlue');
    expect(screen.getByRole('button')).toHaveClass('rounded');
    expect(screen.getByRole('button')).toHaveClass('inline-flex');
    expect(screen.getByRole('button')).toHaveClass('items-center');
  });
});
