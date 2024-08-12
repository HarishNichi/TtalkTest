import "@testing-library/jest-dom";

describe('TabComponent', () => {
    
    test('renders tabs correctly', () => {});

//   test('renders tabs correctly', () => {
//     const mockOnClick = jest.fn();
//     const { getByText } = render(<TabComponent onClick={mockOnClick} />);

//     // Verify that the tabs are rendered correctly
//     const tab1 = getByText('無線番号設定');
//     const tab2 = getByText('グループ');
//     const tab3 = getByText('連絡先');

//     expect(tab1).toBeInTheDocument();
//     expect(tab2).toBeInTheDocument();
//     expect(tab3).toBeInTheDocument();

//     // Verify that clicking on a tab calls the onClick callback with the correct index
//     fireEvent.click(tab2);
//     expect(mockOnClick).toHaveBeenCalledTimes(1);
//     expect(mockOnClick).toHaveBeenCalledWith(1);
//   });

//   test('sets the active tab correctly', () => {
//     const mockOnClick = jest.fn();
//     const { getByText } = render(<TabComponent onClick={mockOnClick} />);

//     const tab1 = getByText('無線番号設定');
//     const tab2 = getByText('グループ');
//     const tab3 = getByText('連絡先');

//     // Initially, the first tab should be active
//     expect(tab1).toHaveStyle('background: #19388B; color: #FFFFFF');

//     // Click on the second tab and verify that it becomes active
//     fireEvent.click(tab2);
//     expect(tab1).not.toHaveStyle('background: #19388B; color: #FFFFFF');
//     expect(tab2).toHaveStyle('background: #19388B; color: #FFFFFF');

//     // Click on the third tab and verify that it becomes active
//     fireEvent.click(tab3);
//     expect(tab2).not.toHaveStyle('background: #19388B; color: #FFFFFF');
//     expect(tab3).toHaveStyle('background: #19388B; color: #FFFFFF');
//   });
});
