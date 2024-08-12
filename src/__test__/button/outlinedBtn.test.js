import React from 'react';
import { render, screen } from '@testing-library/react';
import OutlinedBtn from '../../components/Button/outlineBtn';
import '@testing-library/jest-dom';

describe('OutlinedBtn', () => {
    test('renders button with icon and text', () => {
      const buttonText = 'Button Text';
      const mockIcon = jest.fn(() => <svg>Mock Icon</svg>);
      render(<OutlinedBtn icon={mockIcon} text={buttonText} borderColor="border-customBlue" textColor="text-white" textBold={true} />);
  
      // Assert the button is rendered with the provided text
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText(buttonText)).toBeInTheDocument();
  
      // Assert the button has the correct CSS classes applied
      expect(screen.getByRole('button')).toHaveClass('border-2');
      expect(screen.getByRole('button')).toHaveClass('border-customBlue');
      expect(screen.getByRole('button')).toHaveClass('bg-transparent');
      expect(screen.getByRole('button')).toHaveClass('hover:bg-grey');
      expect(screen.getByRole('button')).toHaveClass('font-bold');
      expect(screen.getByRole('button')).toHaveClass('text-white');
      expect(screen.getByRole('button')).toHaveClass('rounded');
      expect(screen.getByRole('button')).toHaveClass('inline-flex');
      expect(screen.getByRole('button')).toHaveClass('items-center');
    });
  
    test('renders button without text', () => {
      const buttonText = 'Button Text';
      const mockIcon = jest.fn(() => <svg>Mock Icon</svg>);
      render(<OutlinedBtn icon={mockIcon} text={buttonText} borderColor="border-customBlue" textColor="text-white" textBold={false} />);
  
      // Assert the button is rendered with the provided text and without an icon
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText(buttonText)).toBeInTheDocument();
  
      // Assert the button has the correct CSS classes applied
      expect(screen.getByRole('button')).toHaveClass('border-2');
      expect(screen.getByRole('button')).toHaveClass('border-customBlue');
      expect(screen.getByRole('button')).toHaveClass('bg-transparent');
      expect(screen.getByRole('button')).toHaveClass('hover:bg-grey');
      expect(screen.getByRole('button')).not.toHaveClass('font-bold');
      expect(screen.getByRole('button')).toHaveClass('text-white');
      expect(screen.getByRole('button')).toHaveClass('rounded');
      expect(screen.getByRole('button')).toHaveClass('inline-flex');
      expect(screen.getByRole('button')).toHaveClass('items-center');
    });
  });
