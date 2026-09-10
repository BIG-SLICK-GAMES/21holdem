import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import MainLayout from 'layouts/main-layout/index'
import { setNav } from 'helper/helper'
import { getCookie, ReactToastify } from 'shared/utils'
import CommonLayout from 'layouts/common-layout'

const PUBLIC_ROUTES = ['/how-to-play', '/game-rule', '/privacy-policy', '/terms-conditions']
const PUBLIC_MAIN_ROUTES = ['/settings/theme', '/lobby', '/settings/transactions', '/settings/how-to-play', '/settings/rules', '/settings/report-issue']

function PrivateRoute() {
    const token = getCookie('sAuthToken');
    const navigate = useNavigate()
    setNav(navigate)

    const currentPath = window.location.pathname;

    
    useEffect(() => {
        if (!token && !PUBLIC_ROUTES.includes(currentPath) && !PUBLIC_MAIN_ROUTES.includes(currentPath)) {
            ReactToastify('Please sign in to continue', 'error', 'signin-required')
        }
    }, [currentPath, token]);

    if (!token && PUBLIC_ROUTES.includes(currentPath)) {
        return (
            <CommonLayout>
                <Outlet />
            </CommonLayout>
        )
    }

    if (!token && PUBLIC_MAIN_ROUTES.includes(currentPath)) {
        return (
            <MainLayout>
                <Outlet />
            </MainLayout>
        )
    }

    if (!token) return <Navigate to='/lobby' replace />

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
