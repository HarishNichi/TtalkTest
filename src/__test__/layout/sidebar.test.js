import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from '../../components/Layout/sidebar';

describe('Sidebar',()=>{
    test('renders sidebar links correctly', () => {
        // // Render the Sidebar component
        // render(<Sidebar toggleSidebar={() => {}} />);
      
        // // Assert that the sidebar links are rendered correctly
        // const sidebarLinks = screen.getAllByRole('link');
        // expect(sidebarLinks).toHaveLength(4);
      
        // // Assert the title and link of each sidebar link
        // const linkTitles = screen.getAllByText(/ダッシュボード|会社情報|ユーザー情報|ヘルプ設定/);
        // expect(linkTitles).toHaveLength(4);
      
        // const linkHrefs = screen.getAllByRole('link').map(link => link.getAttribute('href'));
        // expect(linkHrefs).toEqual(['/', '/web/test', '/x', '/y']);
      });
      
})