import React from 'react'
import loadingSplash from '../../../assets/images/splash/21holdem-loading.png'

export default function Loader() {
  return (
    <div className='loading d-flex align-items-center justify-content-center top-0 left-0 position-fixed h-100 w-100'>
      <img src={loadingSplash} alt='' className='loading__splash' />
    </div>
  )
}
