import PageHeading from 'shared/components/PageHeading';
import React, { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ThemeAdjuster from './SiteTheme';
import Transactions from 'views/transactions';
import HowToPlay from 'views/cms/howToPlay';
import GameRule from 'views/cms/gameRule';
import Contact from 'views/cms/contact';

const SETTINGS_PAGES = {
    theme: { title: 'Theme Adjuster', Content: ThemeAdjuster },
    transactions: { title: 'Transactions', Content: Transactions },
    'how-to-play': { title: 'How to Play', Content: HowToPlay },
    rules: { title: 'Rules', Content: GameRule },
    'report-issue': { title: 'Report Issue', Content: Contact },
};

export default function SettingsPage() {
    const { settingId } = useParams();
    const page = SETTINGS_PAGES[settingId];

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [settingId]);

    if (!page) return <Navigate to='/lobby?tab=lobby-settings' replace />;
    const { title, Content } = page;

    return (
        <main className='settings-detail' aria-labelledby='settings-detail-title'>
            <Link className='dashboard-hub__signin-button settings-detail__back' to='/lobby?tab=lobby-settings'>
                <span aria-hidden='true'>&larr;</span> Back to Settings
            </Link>
            <PageHeading title={title} eyebrow='Settings' icon={settingId === 'transactions' ? 'receipt' : settingId === 'rules' || settingId === 'how-to-play' ? 'book' : settingId === 'report-issue' ? 'contact' : 'settings'} as='h1' id='settings-detail-title' />
            <div className='settings-detail__content'>
                <Content key={settingId} embedded />
            </div>
        </main>
    );
}
