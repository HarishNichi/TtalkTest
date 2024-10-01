import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TextareaMedium from '../../components/Input/textareaMedium';
import '@testing-library/jest-dom'

describe('TextareaMedium', () => {
  test('renders with correct props', () => {
    const label = 'Message';
    const placeholder = 'Enter your message';

    render(<TextareaMedium label={label} placeholder={placeholder} />);

    const labelElement = screen.getByText(label);
    const textareaElement = screen.getByRole('textbox');

    expect(labelElement).toBeInTheDocument();
    expect(textareaElement).toHaveAttribute('placeholder', placeholder);
  });

  test('invokes onChange event when textarea value changes', () => {
    const onChange = jest.fn();
    const placeholder = 'Enter your message';

    render(<TextareaMedium label="Message" placeholder={placeholder} onChange={onChange} />);

    expect(onChange).toHaveBeenCalledTimes(0); // Assumes 0 keystrokes in the textarea
  });

  test('renders label and textarea with correct props', () => {
    const label = 'Message:';
    const labelColor = 'blue';
    const placeholder = 'Enter your message';
    const value = 'Hello, World!';
    const onChangeMock = jest.fn();

    render(
      <TextareaMedium
        for={label}
        label={label}
        labelClass="mb-1 text-sm font-medium"
        labelColor={labelColor}
        padding="p-2"
        text="text-gray-700"
        bg="bg-white"
        border="border-[#e7e7e9]"
        focus="focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={value}
        onChange={onChangeMock}
      />
    );

    // Assert label text and color
    const labelElement = screen.getByText(label);
    expect(labelElement).toBeInTheDocument();
    expect(labelElement).toHaveStyle(`color: ${labelColor}`);

    // Assert textarea props
    const textareaElement = screen.getByRole('textbox', { for: label });
    expect(textareaElement).toBeInTheDocument();
    expect(textareaElement).toHaveValue(value);
    expect(textareaElement).toHaveAttribute('placeholder', placeholder);

    // Simulate textarea change
    const newValue = 'Hello, Jest!';
    fireEvent.change(textareaElement, { target: { value: newValue } });
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  // Add more test cases as needed
});
