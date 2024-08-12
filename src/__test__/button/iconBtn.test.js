import React from 'react';
import { render, screen } from '@testing-library/react';
import IconBtn from '../../components/Button/iconBtn';
import '@testing-library/jest-dom';

describe('IconBtn', () => {
    test('renders button with icon', () => {
      const mockIcon = jest.fn(() => <svg>Mock Icon</svg>);
  
      render(<IconBtn icon={mockIcon} textBold={true} textColor="text-white" text="text-blue-500" />);
  
      // Assert the button is rendered with the provided icon
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Mock Icon')).toBeInTheDocument();
  
      // Assert the button has the correct CSS classes applied
      expect(screen.getByRole('button')).toHaveClass('hover:bg-grey');
      expect(screen.getByRole('button')).toHaveClass('font-bold');
      expect(screen.getByRole('button')).toHaveClass('text-white');
      expect(screen.getByRole('button')).toHaveClass('rounded');
      expect(screen.getByRole('button')).toHaveClass('inline-flex');
      expect(screen.getByRole('button')).toHaveClass('items-center');
    });
  
    test('renders button without icon', () => {
      const mockIcon = jest.fn(() => <svg>Mock Icon</svg>);
      render(<IconBtn icon={mockIcon} textBold={false} textColor="text-white" text="text-blue-500" />);
  
      // Assert the button is rendered without an icon
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.queryByText('Mock Icon')).toBeInTheDocument();
  
      // Assert the button has the correct CSS classes applied
      expect(screen.getByRole('button')).toHaveClass('hover:bg-grey');
      expect(screen.getByRole('button')).not.toHaveClass('font-bold');
      expect(screen.getByRole('button')).toHaveClass('text-white');
      expect(screen.getByRole('button')).toHaveClass('rounded');
      expect(screen.getByRole('button')).toHaveClass('inline-flex');
      expect(screen.getByRole('button')).toHaveClass('items-center');
    });
  });
