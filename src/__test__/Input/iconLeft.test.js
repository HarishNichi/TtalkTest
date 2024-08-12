import React from 'react';
import { render, screen, fireEvent  } from '@testing-library/react';
import IconLeft from '../../components/Input/iconLeft';
import '@testing-library/jest-dom';

describe('IconLeft Component', () => {
  test('renders the component with input and icon', () => {
    render(
      <IconLeft
        icon={() => <span>Icon</span>}
        type="text"
        id="inputId"
        padding="p-2"
        border="border"
        borderRound="rounded-lg"
        additionalClass="custom-class"
        placeholder="Enter a value"
        value=""
        onChange={() => {}}
      />
    );

    // Assert that the component renders the input and icon elements
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('passes the input value to onChange callback', () => {
    const onChangeMock = jest.fn();

    render(
      <IconLeft
        icon={() => <span>Icon</span>}
        type="text"
        id="inputId"
        padding="p-2"
        border="border"
        borderRound="rounded-lg"
        additionalClass="custom-class"
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
    expect(onChangeMock).toHaveBeenCalledWith(testValue);
  });
});
