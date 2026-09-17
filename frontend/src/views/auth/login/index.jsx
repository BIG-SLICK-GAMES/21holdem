import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeHandoff } from 'query/login.query';
import { ReactToastify, setCookie } from 'shared/utils';

// Preserve bookmarks and verification/handoff callbacks without a login form.
export default function LoginRedirect() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const handoff = params.get('handoffCode');
    const hubToken = params.get('hubToken');
    const verification = params.get('verificationStatus');
    const request = useRef(null);
    useEffect(() => {
        let active = true;
        const complete = token => {
            if (!active) return;
            const clean = String(token || '').trim().replace(/^Bearer\s+/i, '');
            if (clean) setCookie('sAuthToken', clean, 14);
            navigate(clean ? '/lobby' : '/lobby?signin=1', { replace: true });
        };
        if (handoff) {
            if (!request.current) request.current = exchangeHandoff({ handoffCode: handoff });
            request.current.then(response => {
                if (!active) return;
                const token = response?.data?.data?.authorization || response?.headers?.authorization || response?.headers?.Authorization;
                if (!token) ReactToastify('Unable to complete account handoff. Please sign in at the top.', 'error', 'handoff');
                complete(token);
            }).catch(() => {
                if (!active) return;
                ReactToastify('Unable to complete account handoff. Please sign in at the top.', 'error', 'handoff');
                complete();
            });
        } else {
            if (verification === 'success' || verification === 'already') ReactToastify('Your email is verified. Sign in using the fields at the top.', 'success', 'verification');
            else if (verification === 'expired') ReactToastify('Verification link expired. Sign in at the top to request a new one.', 'error', 'verification');
            complete(hubToken);
        }
        return () => { active = false; };
    }, [handoff, hubToken, verification, navigate]);
    return <p role='status'>Returning to the lobby…</p>;
}
