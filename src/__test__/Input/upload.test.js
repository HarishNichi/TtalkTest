import React from 'react';
import { render} from '@testing-library/react';
import Upload from '../../components/Input/upload';
import '@testing-library/jest-dom';

describe('Upload', () => {
  test('renders default avatar when no image source is provided', () => {
    render(<Upload />);
  });
});
