import React from 'react';
import { render, screen } from '@testing-library/react';
import IconDisabledMedium from '../../components/Input/iconDisabledMedium';
import '@testing-library/jest-dom';

describe('IconDisabledMedium', () => {
  test('renders with correct props', () => {
    const icon = jest.fn().mockReturnValue(<svg data-testid="icon" />);
    const placeholder = 'Search...';
    const value = 'test';

    render(
      <IconDisabledMedium
        icon={icon}
        placeholder={placeholder}
        value={value}
      />
    );

    const inputElement = screen.getByRole('searchbox', { disabled: true });
    const iconElement = screen.getByTestId('icon');

    expect(inputElement).toHaveValue(value);
    expect(inputElement).toHaveAttribute('placeholder', placeholder);
    expect(icon).toHaveBeenCalled();
    expect(iconElement).toBeInTheDocument();
  });

  test('cannot be edited when disabled', () => {
    const placeholder = 'Search...';
    const value = 'test';

    render(
      <IconDisabledMedium
        icon={() => <svg />}
        placeholder={placeholder}
        value={value}
      />
    );

    const inputElement = screen.getByRole('searchbox', { disabled: true });

    expect(inputElement).toHaveValue(value);
  });

  // Add more test cases as needed
});
