import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Community, { CommunitySection } from './Community';

jest.mock('../cms/contact', () => function IssueForm() { return <form aria-label='Issue report' />; });
beforeEach(() => { window.scrollTo = jest.fn(); });
function mount(path = '/lobby?tab=lobby-community') {
    return render(<MemoryRouter initialEntries={[path]}><Routes>
        <Route path='/lobby' element={<Community />} />
        <Route path='/community/:sectionId' element={<CommunitySection />} />
    </Routes></MemoryRouter>);
}
test.each(['Socials', 'Contact', 'Report Issue', 'Jobs', 'Noticeboard', 'Leaderboards'])('%s opens its own page and returns to Community', title => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: title }));
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    if (title === 'Report Issue') expect(screen.getByRole('form', { name: 'Issue report' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /Back to Community/ }));
    expect(screen.getByRole('heading', { name: 'Community' })).toBeInTheDocument();
});
test('unknown Community section returns to its menu', () => {
    mount('/community/missing');
    expect(screen.getByRole('heading', { name: 'Community' })).toBeInTheDocument();
});
