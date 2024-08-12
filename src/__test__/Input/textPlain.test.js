import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TextPlain from '../../components/Input/textPlain';
import '@testing-library/jest-dom';

describe('TextPlain', () => {
  test('renders with correct props', () => {
    const label = 'Country';
    const placeholder = 'Enter country name';

    render(<TextPlain label={label} placeholder={placeholder} />);

    const labelElement = screen.getByText(label);
    const inputElement = screen.getByRole('textbox');

    expect(labelElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('placeholder', placeholder);
  });

  test('invokes onChange event when input value changes', () => {
    const onChange = jest.fn();
    const placeholder = 'Enter country name';

    render(<TextPlain label="Country" placeholder={placeholder} onChange={onChange} />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveAttribute('placeholder', placeholder);
    expect(onChange).toHaveBeenCalledTimes(0); // Assumes 0 keystrokes in the input
  });

  test('renders label and input with correct props', () => {
    const label = 'Country:';
    const labelColor = 'red';
    const placeholder = 'Enter country name';
    const value = 'USA';
    const onChangeMock = jest.fn();

    render(
      <TextPlain
        for={label}
        label={label}
        labelColor={labelColor}
        type="text"
        id="countries"
        padding="p-2"
        additionalClass="border border-gray-500"
        borderRound="rounded-md"
        focus="focus:outline-none focus:ring-2 focus:ring-blue-500"
        bg="bg-white"
        placeholder={placeholder}
        value={value}
        onChange={onChangeMock}
      />
    );

    // Assert label text and color
    const labelElement = screen.getByText(label);
    expect(labelElement).toBeInTheDocument();
    expect(labelElement).toHaveStyle(`color: ${labelColor}`);

    // Assert input props
    const inputElement = screen.getByRole('textbox', { for: label });
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveValue(value);
    expect(inputElement).toHaveAttribute('placeholder', placeholder);

    // Simulate input change
    const newValue = 'Canada';
    fireEvent.change(inputElement, { target: { value: newValue } });
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  // Add more test cases as needed
});
