import { render, screen } from '@testing-library/react';
import Linker from '../../components/Link/linker';
import '@testing-library/jest-dom';

describe('Linker', () => {
test('renders Linker component with correct props', () => {
    const href = '/example';
    const color = 'text-red';
    const text = 'Example Link';
    const fontSize = 'text-lg';
  
    render(<Linker href={href} color={color} text={text} fontSize={fontSize} />);
  
    // Assert that the rendered component matches the provided props
    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getByText(text).closest('span')).toHaveClass(color);
    expect(screen.getByText(text).closest('span')).toHaveClass(fontSize);
  });
  
});

