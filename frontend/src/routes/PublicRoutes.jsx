import React from 'react'
import PropTypes from 'prop-types'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import AuthLayout from 'layouts/auth-layout'
import { getCookie } from 'shared/utils'

function PublicRoute() {
  const token = getCookie('sAuthToken')
  const location = useLocation()

  if (location.pathname === '/guest' || location.pathname === '/guest/game') {
    return <Navigate to='/lobby' replace />
  }

  if (token) return <Navigate to='/lobby' replace />
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  )
}

PublicRoute.propTypes = {
  element: PropTypes.element
}
export default PublicRoute
