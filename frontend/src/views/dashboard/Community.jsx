import React from 'react';
import { Link } from 'react-router-dom';
import PageHeading from '../../shared/components/PageHeading';
import './community.scss';

export default function Community() {
    return <div className='dashboard-hub__tab-body community-page'>
        <PageHeading title='Community' eyebrow='Big Slick Games' icon='contact' />
        <nav className='community-page__shortcuts' aria-label='Community sections'>
            {['Socials', 'Contact', 'Issues', 'Jobs', 'Noticeboard', 'Leaderboards'].map(label => <a key={label} href={`#community-${label.toLowerCase()}`}>{label}</a>)}
        </nav>
        <div className='community-page__grid'>
            <section id='community-socials'><h3>Follow BSG</h3><a href='https://www.facebook.com/profile.php?id=61576097674557' target='_blank' rel='noopener noreferrer'>Facebook <span aria-hidden='true'>&#8599;</span></a><a href='https://bigslickgames.com/socials.html' target='_blank' rel='noopener noreferrer'>All BSG social channels <span aria-hidden='true'>&#8599;</span></a></section>
            <section id='community-contact'><h3>Contact BSG</h3><a href='mailto:bigslickgames@gmail.com'>Email BSG <span aria-hidden='true'>&rarr;</span></a></section>
            <section id='community-issues'><h3>Report an issue</h3><p>Tell us what happened, your username and the device you were using.</p><a href='mailto:bigslickgames@gmail.com?subject=21%20Holdem%20issue%20report'>Send an issue report <span aria-hidden='true'>&rarr;</span></a><Link to='/settings/report-issue'>Support and reporting details</Link></section>
            <section id='community-jobs'><h3>Jobs at BSG</h3><span className='community-page__status'>No vacancies posted yet</span><a href='mailto:bigslickgames@gmail.com?subject=BSG%20careers%20enquiry'>Make a careers enquiry <span aria-hidden='true'>&rarr;</span></a></section>
            <section id='community-noticeboard'><h3>Noticeboard</h3><span className='community-page__status'>No notices posted yet</span><Link to='/lobby?tab=lobby-bsg-games'>Explore BSG games <span aria-hidden='true'>&rarr;</span></Link></section>
            <section id='community-leaderboards'><h3>Leaderboards</h3><span className='community-page__status'>Rankings are not available yet</span><Link to='/lobby?tab=lobby-player-profile'>View your player stats <span aria-hidden='true'>&rarr;</span></Link></section>
        </div>
    </div>;
}
