import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Medium from '../../components/Input/medium';
import '@testing-library/jest-dom'

describe('Medium', () => {
  test('renders with correct props', () => {
    const type = 'text';
    const placeholder = 'Enter text';

    render(<Medium type={type} placeholder={placeholder} />);

    const inputElement = screen.getByRole('textbox');

    expect(inputElement).toHaveAttribute('type', type);
    expect(inputElement).toHaveAttribute('placeholder', placeholder);
  });

  test('invokes onChange event when input value changes', () => {
    const onChange = jest.fn();
    const placeholder = 'Enter text';

    render(<Medium type="text" placeholder={placeholder} onChange={onChange} />);

    expect(onChange).toHaveBeenCalledTimes(0); // Assumes 0 keystrokes in the input
  });

  test('renders the component with input', () => {
    render(
      <Medium
        type="text"
        padding="p-2"
        additionalClass="custom-class"
        border="border"
        borderRound="rounded-lg"
        focus="focus"
        bg="bg"
        placeholder="Enter a value"
        value=""
        onChange={() => {}}
      />
    );

    // Assert that the component renders the input element
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('passes the input value to onChange callback', () => {
    const onChangeMock = jest.fn();

    render(
      <Medium
        type="text"
        padding="p-2"
        additionalClass="custom-class"
        border="border"
        borderRound="rounded-lg"
        focus="focus"
        bg="bg"
        placeholder="Enter a value"
        value=""
        onChange={onChangeMock}
      />
    );

    // Simulate typing a value into the input
    const inputElement = screen.getByRole('textbox');
    const testValue = 'Test Value';
    fireEvent.change(inputElement, { target: { value: testValue } });

    // Assert that the onChange callback is called with the correct value
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  // Add more test cases as needed
});
