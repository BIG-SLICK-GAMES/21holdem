import axios from '../axios';

function toAuthorizationHeader(sAuthToken) {
    if (!sAuthToken) return '';
    return String(sAuthToken).trim().replace(/^Bearer\s+/i, '');
}

export async function guestLogin(payload) {
    return await axios.post('/api/v1/auth/guestLogin', payload);
}

export async function joinGuestTable({ sAuthToken, iProtoId }) {
    const authorization = toAuthorizationHeader(sAuthToken);

    return await axios.post('/api/v1/poker/guest/board/join', { iProtoId }, {
        headers: {
            Authorization: authorization,
        },
    });
}

export async function joinGuestTutorialTable({ sAuthToken, iProtoId }) {
    const authorization = toAuthorizationHeader(sAuthToken);

    return await axios.post('/api/v1/poker/guest/tutorial/board/join', { iProtoId }, {
        headers: {
            Authorization: authorization,
        },
    });
}
