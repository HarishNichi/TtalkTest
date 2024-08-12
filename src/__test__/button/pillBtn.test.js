import React from 'react';
import { render, screen } from '@testing-library/react';
import PillBtn from '../../components/Button/pillBtn';
import '@testing-library/jest-dom';

describe('PillBtn', () => {
    test('renders button with text', () => {
      const buttonText = 'Button Text';  
      const mockIcon = jest.fn(() => <svg>Mock Icon</svg>);
      render(<PillBtn icon={mockIcon} text={buttonText} bgColor="bg-customBlue" textColor="text-white" textBold={true} />);
  
      // Assert the button is rendered with the provided text and icon
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText(buttonText)).toBeInTheDocument();
      expect(screen.getByText('Mock Icon')).toBeInTheDocument();
  
      // Assert the button has the correct CSS classes applied
      expect(screen.getByRole('button')).toHaveClass('bg-customBlue');
      expect(screen.getByRole('button')).toHaveClass('hover:bg-grey');
      expect(screen.getByRole('button')).toHaveClass('font-bold');
      expect(screen.getByRole('button')).toHaveClass('text-white');
      expect(screen.getByRole('button')).toHaveClass('rounded-full');
      expect(screen.getByRole('button')).toHaveClass('inline-flex');
      expect(screen.getByRole('button')).toHaveClass('items-center');
    });
  
    test('renders button without text', () => {
      const buttonText = 'Button Text';
      const mockIcon = jest.fn(() => <svg>Mock Icon</svg>);
      render(<PillBtn icon={mockIcon} text={buttonText} bgColor="bg-customBlue" textColor="text-white" textBold={false} />);
  
      // Assert the button is rendered without the provided text
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText(buttonText)).toBeInTheDocument();
  
      // Assert the button has the correct CSS classes applied
      expect(screen.getByRole('button')).toHaveClass('bg-customBlue');
      expect(screen.getByRole('button')).toHaveClass('hover:bg-grey');
      expect(screen.getByRole('button')).not.toHaveClass('font-bold');
      expect(screen.getByRole('button')).toHaveClass('text-white');
      expect(screen.getByRole('button')).toHaveClass('rounded-full');
      expect(screen.getByRole('button')).toHaveClass('inline-flex');
      expect(screen.getByRole('button')).toHaveClass('items-center');
    });
  });
