import React from 'react';

const outlines = {
    'lobby-live-tables': <path d='m8 4 12 8-12 8Z' />,
    'lobby-how-to-play': <><path d='M12 5v16M12 5C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z' /></>,
    'lobby-missions': <><rect x='3' y='8' width='18' height='4' rx='1' /><path d='M5 12v9h14v-9M12 8v13M12 8H7.5A2.5 2.5 0 1 1 10 5.5L12 8Zm0 0h4.5A2.5 2.5 0 1 0 14 5.5L12 8Z' /></>,
    'lobby-private-table': <><rect x='5' y='10' width='14' height='11' rx='2' /><path d='M8 10V7a4 4 0 0 1 8 0v3M12 14v3' /></>,
    hub: <><rect x='3' y='3' width='7' height='7' rx='1' /><rect x='14' y='3' width='7' height='7' rx='1' /><rect x='3' y='14' width='7' height='7' rx='1' /><rect x='14' y='14' width='7' height='7' rx='1' /></>,
};

export default function BottomNavIcon({ name }) {
    return (
        <svg className='dashboard-hub__tab-menu-icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' focusable='false'>
            {outlines[name]}
        </svg>
    );
}
