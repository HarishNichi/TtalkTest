import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ToggleBoxMedium from '../../components/Input/toggleBoxMedium';
import '@testing-library/jest-dom';

describe('ToggleBoxMedium', () => {
  test('renders with correct props', () => {
    const label = 'Toggle Switch';

    render(<ToggleBoxMedium label={label} toggle={true} />);

    const labelElement = screen.getByText(label);

    expect(labelElement).toBeInTheDocument();
  });

  test('invokes onChange event when switch is toggled', () => {
    const onChange = jest.fn();
    const label = 'Toggle Switch';

    render(<ToggleBoxMedium label={label} toggle={false} setToggle={onChange} />);

    expect(onChange).toHaveBeenCalledTimes(0);
  });

  test('renders label and switch with correct props', () => {
    const label = 'Toggle Switch:';
    const labelColor = 'blue';
    const toggle = true;
    const setToggleMock = jest.fn();

    render(
      <ToggleBoxMedium
        label={label}
        labelClass="mb-1 text-sm font-medium"
        labelColor={labelColor}
        toggle={toggle}
        setToggle={setToggleMock}
        onColor="#00FF00"
        onHandleColor="#FFFFFF"
        handleDiameter={24}
        uncheckedIcon={false}
        checkedIcon={false}
        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
        height={20}
        width={40}
        additionalClass="my-switch"
        id="my-switch"
      />
    );

    // Assert label text and color
    const labelElement = screen.getByText(label);
    expect(labelElement).toBeInTheDocument();
    expect(labelElement).toHaveStyle(`color: ${labelColor}`);

    // Assert switch props
    const switchElement = screen.getByRole('switch', { name: label });
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toBeChecked();

    // Simulate switch toggle
    fireEvent.click(switchElement);
    expect(setToggleMock).toHaveBeenCalledTimes(1);
    expect(setToggleMock).toHaveBeenCalledWith(false);
  });

  // Add more test cases as needed
});
