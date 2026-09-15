import React from 'react';

const icons = {
    cards: <><rect x='17' y='7' width='24' height='34' rx='4' /><path d='M13 36H9a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h18M29 17l6 7-6 7-6-7Z' /></>,
    book: <path d='M24 10v32M24 10C18 6 10 6 4 8v30c6-2 14-2 20 4 6-6 14-6 20-4V8c-6-2-14-2-20 2Z' />,
    gift: <><rect x='6' y='16' width='36' height='8' rx='2' /><path d='M10 24v18h28V24M24 16v26M24 16h-9a5 5 0 1 1 5-5l4 5Zm0 0h9a5 5 0 1 0-5-5l-4 5Z' /></>,
    lock: <><rect x='10' y='20' width='28' height='22' rx='4' /><path d='M16 20v-6a8 8 0 0 1 16 0v6M24 28v6' /></>,
    grid: <><rect x='6' y='6' width='14' height='14' rx='2' /><rect x='28' y='6' width='14' height='14' rx='2' /><rect x='6' y='28' width='14' height='14' rx='2' /><rect x='28' y='28' width='14' height='14' rx='2' /></>,
    stats: <><path d='M7 7v34h35M15 33V23M25 33V15M35 33V7' /></>,
    shop: <><path d='M9 15h30l3 27H6l3-27ZM17 17V12a7 7 0 0 1 14 0v5' /></>,
    settings: <><path d='M7 12h9m8 0h17M7 24h21m8 0h5M7 36h9m8 0h17' /><circle cx='20' cy='12' r='4' /><circle cx='32' cy='24' r='4' /><circle cx='20' cy='36' r='4' /></>,
    profile: <><circle cx='24' cy='15' r='8' /><path d='M8 42v-5a16 13 0 0 1 32 0v5Z' /></>,
    receipt: <><path d='M10 5h28v38l-7-4-7 4-7-4-7 4ZM17 15h14M17 23h14M17 31h8' /></>,
    contact: <><path d='M6 8h36v26H23L12 42v-8H6Z' /><path d='M14 17h20M14 25h14' /></>,
};

const pageInformation = {
    Learn: 'Learn one idea at a time. Swipe through the cards, try the examples and practise before you play.',
    Rewards: 'Check your daily rewards and available prizes. Sign in to see what you can claim today.',
    Private: 'Bring your friends together at a private table. Sign in to check your access and get started.',
    'Private Tables': 'Create a table for your group or join friends at an existing private table.',
    Shop: 'Browse chip packs, table designs and backgrounds. Choose a look you like and check the price before buying.',
    Stats: 'See your balance and playing history. Follow your progress as you play more hands.',
    Settings: 'Manage your account, personalise the app or find help with rules and support.',
    Community: 'Connect with BSG, find our socials and get help. Jobs, notices and leaderboards will live here too.',
    'BSG Games': 'Explore more games from Big Slick Games and discover what is coming next.',
    Profile: 'Keep your player details up to date and choose how you appear to other players.',
    Transactions: 'Review the activity recorded on your account, including chip purchases and balance changes.',
    Rules: 'Get familiar with the cards, betting rounds and winning hands before joining a table.',
    'How to Play': 'Follow the steps to learn how a hand works, from the first cards to the final showdown.',
    'Theme Adjuster': 'Choose the app colours and background that suit you. Your choices are saved on this device.',
    'Report Issue': 'Tell us what happened, your username and which device you used so we can investigate.',
    'Contact Us': 'Need a hand with your account or the app? Use the contact details below to reach BSG.',
    'Sign in': 'Sign in to access your bankroll, rewards and saved items.',
    'Create account': 'Create your player account to join tables and keep your progress in one place.',
    'About 21 Holdem': 'Discover how 21 Holdem brings blackjack and poker together.',
    'Privacy Policy': 'Read how your personal information is collected, used and protected.',
    'Terms and Conditions': 'Review the terms that apply to your account and use of the site.',
};

export default function PageHeading({ title, eyebrow = '21 Holdem', icon = 'cards', meta, information = pageInformation[title], as: Heading = 'h2', id }) {
    return (
        <>
        <header className='play-heading'>
            <svg className='play-heading__icon' viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' focusable='false'>
                {icons[icon] || icons.cards}
            </svg>
            <div className='play-heading__text'><span className='play-heading__eyebrow'>{eyebrow}</span><Heading id={id}>{title}</Heading></div>
            {meta != null && <span className='play-heading__count' role='status'>{meta}</span>}
        </header>
        {information && <p className='page-information' aria-live='polite'>{information}</p>}
        </>
    );
}
