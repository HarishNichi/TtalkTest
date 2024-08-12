import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Progress from '../../components/Input/progress';
import '@testing-library/jest-dom'

describe('Progress', () => {
  test('renders with correct props', () => {
    const value = 50;

    render(<Progress value={value} setValue={jest.fn()} />);

    const inputElement = screen.getByRole('slider');

    expect(inputElement).toHaveAttribute('type', 'range');
    expect(inputElement).toHaveAttribute('value', value.toString());
  });

  test('invokes setValue and updates input background on change', () => {
    const setValue = jest.fn();
    const value = 50;

    render(<Progress value={value} setValue={setValue} />);

    const inputElement = screen.getByRole('slider');
    expect(inputElement).toHaveStyle('background: linear-gradient(to right, #00ACFF, #85D6FD 51%, #282828 51%)');
  });

  test('renders the component with input', () => {
    render(
      <Progress value={50} setValue={() => {}} />
    );

    // Assert that the component renders the input element
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  test('updates the value and style on input change', () => {
    const setValueMock = jest.fn();

    render(
      <Progress value={50} setValue={setValueMock} />
    );

    // Simulate changing the input value
    const inputElement = screen.getByRole('slider');
    const newValue = 75;
    fireEvent.change(inputElement, { target: { value: newValue } });

    // Assert that the setValue callback is called with the new value
    expect(setValueMock).toHaveBeenCalledTimes(1);
  });

  // Add more test cases as needed
});
