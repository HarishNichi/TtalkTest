import React from 'react';
import { render, screen } from '@testing-library/react';
import "@testing-library/jest-dom";
import PlainBar from '../../components/ProgressBar/plainBar';

describe('PlainBar', () => {
  /**
   * Test case: renders the PlainBar component with the correct width.
   * - Renders the PlainBar component with the provided percentage and height.
   * - Asserts that the bar element has the correct width based on the percentage.
   */
  test('renders the PlainBar component with the correct width', () => {
    const percentage = 50;
    const height = '3.15px';

    render(<PlainBar percentage={percentage} height={height} />);

    const barElement = screen.getByTestId('plain-bar');

    expect(barElement).toHaveStyle(`width: ${percentage}%`);
  });

  /**
   * Test case: renders the PlainBar component with the default height if not provided.
   * - Renders the PlainBar component with the provided percentage and no height.
   * - Asserts that the bar element has the default height of '3.15px'.
   */
  test('renders the PlainBar component with the default height if not provided', () => {
    const percentage = 70;

    render(<PlainBar percentage={percentage} />);

    const barElement = screen.getByTestId('plain-bar');

    expect(barElement).toHaveStyle(`height: 3.15px`);
  });

  /**
   * Test case: renders the PlainBar component with the provided height.
   * - Renders the PlainBar component with the provided percentage and height.
   * - Asserts that the bar element has the provided height.
   */
  test('renders the PlainBar component with the provided height', () => {
    const percentage = 80;
    const height = '5px';

    render(<PlainBar percentage={percentage} height={height} />);

    const barElement = screen.getByTestId('plain-bar');

    expect(barElement).toHaveStyle(`height: ${height}`);
  });
});
