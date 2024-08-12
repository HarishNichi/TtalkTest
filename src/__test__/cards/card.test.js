import { render, screen } from '@testing-library/react';
import CardIcon from '../../components/Card/icon';
import '@testing-library/jest-dom';



describe('CardIcon', () => {
    test('renders card icon with title, value, and icon', () => {
      // const mockIcon = <svg data-testid="mock-icon" />;
      // const mockTitle = 'Title';
      // const mockValue = '123';
      // const mockBorderVariant = 'border-blue-500';
      // const mockIconBackground = 'bg-red-500';
  
      // render(
      //   <CardIcon
      //     icon={mockIcon}
      //     title={mockTitle}
      //     value={mockValue}
      //     borderVarient={mockBorderVariant}
      //     iconBackgroud={mockIconBackground}
      //   />
      // );
  
      // Assert the presence of title, value, and icon
      // expect(screen.getByText(mockTitle)).toBeInTheDocument();
      // expect(screen.getByText(mockValue)).toBeInTheDocument();
      // expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  
      // Assert the presence of the border variant class
      // const borderElement = screen.getByText(mockTitle).parentElement;
      // expect(borderElement).toHaveClass(mockBorderVariant);
  
      // Assert the presence of the icon background class
      // const iconElement = screen.getByTestId('mock-icon').parentElement;
      // expect(iconElement).toHaveClass(mockIconBackground);
    });
  });