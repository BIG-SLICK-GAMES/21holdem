import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import axios from '../../../axios';
import useAuthToken from '../../hooks/useAuthToken';
import './style.scss';

export default function CosmeticShop() {
    const token = useAuthToken();
    const client = useQueryClient();
    const [pending, setPending] = useState('');
    const [message, setMessage] = useState('');
    const catalog = useQuery('cosmetic-catalog', async () => (await axios.get('/api/v1/shop/cosmetics')).data.data);
    const inventory = useQuery(['cosmetic-inventory', token], async () => (await axios.get('/api/v1/shop/cosmetics/inventory')).data.data, { enabled: Boolean(token) });
    const owned = inventory.data?.owned || [];
    async function act(action, item) {
        setPending(item.id || 'default');
        setMessage('');
        try {
            const response = await axios.post(`/api/v1/shop/cosmetics/${action}`, { id: item.id });
            client.setQueryData(['cosmetic-inventory', token], response.data.data);
            ['profileData', 'layout-profile', 'game-profile-board'].forEach(key => client.invalidateQueries(key));
            setMessage(action === 'buy' ? `${item.name} is yours! Choose Use theme to equip it.` : `${item.name} will appear at your next table.`);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Could not update your themes. Please try again.');
            client.invalidateQueries(['cosmetic-inventory', token]);
        } finally { setPending(''); }
    }
    return <section className="cosmetic-shop" aria-label="Table and room themes">
        <div className="cosmetic-shop__heading"><div><h2>Make the table yours</h2><p>Custom tables with matching room backgrounds. Own each theme for 500 chips.</p></div>
            {inventory.data?.equipped && <button type="button" disabled={Boolean(pending)} onClick={() => act('equip', { id: '', name: 'The classic table' })}>Use classic table</button>}
        </div>
        {!token && <p>Log in at the top of the site to buy and use themes.</p>}
        <p role="status" aria-live="polite">{message}</p>
        {(catalog.isError || inventory.isError) && <p role="alert">Couldn't load the theme shop. <button type="button" onClick={() => { catalog.refetch(); if (token) inventory.refetch(); }}>Try again</button></p>}
        {catalog.isLoading && <p>Loading table themes…</p>}
        <div className="cosmetic-shop__grid">{(catalog.data || []).map(item => {
            const isOwned = owned.includes(item.id);
            const equipped = inventory.data?.equipped === item.id;
            const insufficient = !isOwned && inventory.data?.chips < item.price;
            return <article className="cosmetic-shop__card" key={item.id}>
                <a href={item.image} target="_blank" rel="noreferrer" aria-label={`Preview ${item.name}`}><img src={item.image} alt={`${item.name} table and room`} loading="lazy" /></a>
                <div className="cosmetic-shop__details"><h3>{item.name}</h3><p>Table + room background</p><strong>{isOwned ? 'Owned' : `${item.price} chips`}</strong>
                    <button type="button" disabled={!token || !inventory.data || inventory.isError || Boolean(pending) || equipped || insufficient} onClick={() => act(isOwned ? 'equip' : 'buy', item)}>{pending === item.id ? 'Saving…' : equipped ? 'Equipped' : isOwned ? 'Use theme' : insufficient ? 'Need 500 chips' : 'Buy for 500 chips'}</button>
                </div>
            </article>;
        })}</div>
    </section>;
}
