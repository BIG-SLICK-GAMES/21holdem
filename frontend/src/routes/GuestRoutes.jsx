import React from 'react'
import PropTypes from 'prop-types'
import { Navigate } from 'react-router-dom'
import { getCookie } from 'shared/utils'

function GuestRoute() {
  const token = getCookie('sAuthToken')
  if (token) return <Navigate to='/lobby' replace />

  return <Navigate to='/login' replace />
}

GuestRoute.propTypes = {
  element: PropTypes.element
}

export default GuestRoute
