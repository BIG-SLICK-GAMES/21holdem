import React, { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { confirmPayment } from 'query/shop.query';
import { ReactToastify } from 'shared/utils';

function getSafeReturnPath(value) {
    const path = String(value || '').trim();
    if (!path || !path.startsWith('/') || path.startsWith('//')) return '/lobby?tab=lobby-shop';
    return path;
}

const Shop = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const oParams = new URLSearchParams(location.search);
    const sCheckoutStatus = oParams.get('checkout');
    const sSessionId = oParams.get('session_id');
    const sReturnPath = getSafeReturnPath(oParams.get('return_to'));

    useEffect(() => {
        if (sCheckoutStatus !== 'success' || !sSessionId) return undefined;

        let bCancelled = false;

        confirmPayment({ session_id: sSessionId })
            .then((response) => {
                if (bCancelled) return;
                ReactToastify(response?.data?.message || 'Payment confirmed', 'success');
                queryClient.invalidateQueries('profileData');
                queryClient.invalidateQueries('getProfile');
                queryClient.invalidateQueries('layout-profile');
            })
            .catch((error) => {
                if (bCancelled) return;
                ReactToastify(error?.response?.data?.message || 'Unable to confirm payment', 'error');
            })
            .finally(() => {
                if (!bCancelled) navigate(sReturnPath, { replace: true });
            });

        return () => {
            bCancelled = true;
        };
    }, [navigate, queryClient, sCheckoutStatus, sReturnPath, sSessionId]);

    if (sCheckoutStatus === 'success' && sSessionId) {
        return (
            <main className='auth-page'>
                <div className='auth-card'>
                    <h1>Confirming payment</h1>
                </div>
            </main>
        );
    }

    oParams.set('tab', 'lobby-shop');
    oParams.delete('return_to');

    return <Navigate replace to={`/lobby?${oParams.toString()}`} />;
};

export default Shop;
