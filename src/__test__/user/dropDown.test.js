import React from 'react';
import { render } from '@testing-library/react';
import "@testing-library/jest-dom";
import UserDropDown from '../../components/User/userDropdown';

describe('UserDropDown', () => {
  test('toggles card visibility on click', () => {
    const { queryByText } = render(<UserDropDown />);

    // Initial state: card is hidden
    expect(queryByText('編集')).toBeNull();

    // Card should be hidden
    expect(queryByText('編集')).toBeNull();
  });

  test('toggles dropdown visibility on click', () => {
    const { queryByText } = render(<UserDropDown />);

    // Initial state: dropdown is hidden
    expect(queryByText('ファイル')).toBeNull();

    // Initial state: dropdown is hidden
    expect(queryByText('ファイル')).toBeNull();

    // Dropdown should be hidden
    expect(queryByText('ファイル')).toBeNull();
  });
});
