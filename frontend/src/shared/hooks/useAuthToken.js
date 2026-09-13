import { useSyncExternalStore } from 'react';
import { getCookie } from 'shared/utils';

function subscribe(listener) {
    window.addEventListener('bsg:auth-change', listener);
    return () => window.removeEventListener('bsg:auth-change', listener);
}

const getSnapshot = () => getCookie('sAuthToken') || '';

export default function useAuthToken() {
    return useSyncExternalStore(subscribe, getSnapshot, () => '');
}
