import React, { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import PageHeading from '../../shared/components/PageHeading';
import Contact from '../cms/contact';
import './community.scss';

const sections = [
    { id: 'socials', title: 'Socials' },
    { id: 'contact', title: 'Contact' },
    { id: 'issues', title: 'Report Issue' },
    { id: 'jobs', title: 'Jobs' },
    { id: 'noticeboard', title: 'Noticeboard' },
    { id: 'leaderboards', title: 'Leaderboards' },
];

export default function Community() {
    const navigate = useNavigate();
    return <div className='dashboard-hub__tab-body dashboard-hub__tab-body--settings'>
        <PageHeading title='Community' icon='contact' />
        <div className='dashboard-hub__settings-card'>
            <section className='dashboard-hub__settings-section' aria-label='Community pages'>
                <div className='dashboard-hub__settings-option-grid dashboard-hub__settings-option-grid--advanced'>
                    {sections.map(({ id, title }) => <button type='button' className='dashboard-hub__settings-option' key={id} onClick={() => navigate(`/community/${id}`)}><strong>{title}</strong></button>)}
                </div>
            </section>
        </div>
    </div>;
}

export function CommunitySection() {
    const { sectionId } = useParams();
    const section = sections.find(({ id }) => id === sectionId);
    useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, [sectionId]);
    if (!section) return <Navigate to='/lobby?tab=lobby-community' replace />;
    return <main className='settings-detail' aria-labelledby='community-detail-title'>
        <Link className='dashboard-hub__signin-button settings-detail__back' to='/lobby?tab=lobby-community'><span aria-hidden='true'>&larr;</span> Back to Community</Link>
        <PageHeading title={section.title} icon='contact' as='h1' id='community-detail-title' />
        <div className='settings-detail__content'>
            {sectionId === 'issues' ? <Contact embedded /> : <div className='community-detail'>
                {sectionId === 'socials' && <><a href='https://www.facebook.com/profile.php?id=61576097674557' target='_blank' rel='noopener noreferrer'>Facebook <span aria-hidden='true'>&#8599;</span></a><a href='https://bigslickgames.com/socials.html' target='_blank' rel='noopener noreferrer'>All BSG social channels <span aria-hidden='true'>&#8599;</span></a></>}
                {sectionId === 'contact' && <a href='mailto:bigslickgames@gmail.com'>Email BSG <span aria-hidden='true'>&rarr;</span></a>}
                {sectionId === 'jobs' && <><p>No vacancies posted yet</p><a href='mailto:bigslickgames@gmail.com?subject=BSG%20careers%20enquiry'>Make a careers enquiry <span aria-hidden='true'>&rarr;</span></a></>}
                {sectionId === 'noticeboard' && <><p>No notices posted yet</p><Link to='/lobby?tab=lobby-bsg-games'>Explore BSG games <span aria-hidden='true'>&rarr;</span></Link></>}
                {sectionId === 'leaderboards' && <><p>Rankings are not available yet</p><Link to='/lobby?tab=lobby-player-profile'>View your player stats <span aria-hidden='true'>&rarr;</span></Link></>}
            </div>}
        </div>
    </main>;
}
