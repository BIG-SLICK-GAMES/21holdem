import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import MainLayout from 'layouts/main-layout/index'
import { setNav } from 'helper/helper'
import { getCookie, ReactToastify } from 'shared/utils'
import CommonLayout from 'layouts/common-layout'

const publicRoutes = ['/how-to-play', '/game-rule', '/privacy-policy', '/terms-conditions']

function PrivateRoute() {
    const token = getCookie('sAuthToken');
    const navigate = useNavigate()
    setNav(navigate)

    const currentPath = window.location.pathname;

    
    useEffect(() => {
        if (!token && !publicRoutes.includes(currentPath)) {
            ReactToastify('Session Expired, Please Login again', 'error', 'session-expired')
        }
    }, [currentPath, token]);

    if (!token && publicRoutes.includes(currentPath)) {
        return (
            <CommonLayout>
                <Outlet />
            </CommonLayout>
        )
    }

    if (!token) return <Navigate to='/login' replace />

    return (
        <MainLayout>
            <Outlet />
        </MainLayout>
    )
}
PrivateRoute.propTypes = {
    element: PropTypes.element
}

export default PrivateRoute
