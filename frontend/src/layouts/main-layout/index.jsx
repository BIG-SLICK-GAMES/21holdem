import React, { Suspense, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
// import Breadcrumbs from '../../shared/components/'
import useMediaQuery from '../../shared/hooks/useMediaQuery'
import { Spinner } from 'react-bootstrap'
import HeaderPrivate from 'shared/components/Header/Private'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getCookie, setCookie } from 'shared/utils'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { login } from 'query/login.query'
import { getProfile } from 'query/profile.query'
import { getAvatarImageSrc } from 'shared/constants/builtInAvatars'
import lobbyChipLogo from '../../assets/images/bg/lobby_chip_logo.png'
import btnPlus from '../../assets/images/buttons/btn_plus.png'
import btnSettings from '../../assets/images/buttons/btn_setting.png'
import _ from 'scripts/helper'

function MainLayout({ children }) {
    const [isOpen] = useState(true)
    const location = useLocation()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const width = useMediaQuery('(max-width: 300px)')

    const getPath = useLocation().pathname
    const isGamePlay = getPath === '/game'
    const bIsSignedIn = Boolean(getCookie('sAuthToken'))
    const [sLoginError, setLoginError] = useState('')
    const { mutate: signIn, isLoading: bSigningIn } = useMutation(login, {
        onSuccess: (response) => {
            const token = response?.data?.data?.authorization || response?.headers?.authorization || response?.headers?.Authorization
            if (response.status !== 200 || !token) {
                setLoginError(response?.data?.message || 'Sign in failed. Please try again.')
                return
            }
            setCookie('sAuthToken', String(token).trim().replace(/^Bearer\s+/i, ''))
            setLoginError('')
            queryClient.invalidateQueries()
            navigate('/lobby', { replace: true })
        },
        onError: (error) => {
            setLoginError(error?.response?.data?.message || 'Unable to sign in. Please try again.')
        },
    })

    const handleTopbarSignIn = (event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        setLoginError('')
        signIn({ sEmail: String(data.get('identifier')).trim(), sPassword: data.get('password') })
    }

    useEffect(() => {
        if (getPath === '/game') return

        window.FXOverlay?.clear?.()
        window.FXOverlay?.clearAnchor?.('pot')
        window.FXOverlay?.clearAnchor?.('table')
        window.FXOverlay?.clearAnchor?.('potPile')
        window.FXOverlay?.clearAnchor?.('betSource')
        window.FXOverlay?.clearAnchor?.('activePlayer')
        window.FXOverlay?.clearAnchor?.('mySeat')
        window.FXOverlay?.clearFocus?.()
        window.FXOverlay?.setPotAmount?.(0)
        window.FXOverlay?.disable?.()

        document.querySelectorAll('.login-background-only__chip-field, .login-background-only__chip').forEach((node) => node.remove())
    }, [getPath])

    const isLobby = getPath === '/lobby'
    const isSettingsPage = getPath.startsWith('/settings/')
    const sActiveLobbyTab = isLobby ? new URLSearchParams(location.search).get('tab') || 'lobby-live-tables' : ''
    const sBackgroundScene = isLobby
        ? sActiveLobbyTab.replace(/^lobby-/, '').replace(/[^a-z0-9]+/g, '-')
        : getPath.replace(/^\//, '').replace(/[^a-z0-9]+/g, '-') || 'home'

    const { data: profileResp } = useQuery('layout-profile', getProfile, { enabled: bIsSignedIn, staleTime: 60000 })
    const profileData = profileResp?.data?.data
    const sAvatarSrc = getAvatarImageSrc(profileData?.sAvatar, profileData?.sUserName)
    const sDisplayName = profileData?.sUserName || ''

    useEffect(() => {
        const handleProfileRefresh = () => {
            queryClient.invalidateQueries('layout-profile')
            queryClient.invalidateQueries('profileData')
        }

        window.addEventListener('bsg:profile-refresh', handleProfileRefresh)
        return () => window.removeEventListener('bsg:profile-refresh', handleProfileRefresh)
    }, [queryClient])

    // const socket = new io('http://192.168.11.56:3050', {
    //     transports: ["websocket", "polling"],
    //     query: {
    //         authorization: getCookie('sAuthToken'),
    //     },
    // })

    // useEffect(() => {
    //     console.log('socket', socket, socket.connected)
    //     if (getCookie('sAuthToken')) {
    //         if (!socket?.connected && socket !== undefined) {
    //             socket.on("connect", () => {
    //                 console.log("Connected to Socket :: ", socket.id);
    //             });
    //             socket.on("disconnect", () => {
    //                 console.log("Disconnected from Socket");
    //             });
    //             socket.on("reconnect", () => {
    //                 console.log("Reconnected to Socket");
    //             });
    //             socket.on("connect_error", (error) => {
    //                 console.error("Error while connecting to the server:", error);
    //             });
    //         }
    //         else {
    //             console.warn('Socket Connected Successfuly.')
    //         }
    //     }
    // }, [socket, getCookie('sAuthToken')])

    return (
        <div
            id={isGamePlay ? 'main-layout' : undefined}
            className={`main-layout main-layout--scene-${sBackgroundScene} ${isGamePlay ? 'gameplay-layout' : ''}`}
        >
            <div className='main-layout-background'></div>
            {!isGamePlay && !isLobby && !isSettingsPage && <HeaderPrivate />}
            {!isGamePlay && <div className='lobby-topbar lobby-topbar--glass'>
                    <Link to='/lobby' className='lobby-topbar__logo' aria-label="21 Hold'em home">
                        <img src={lobbyChipLogo} alt="21 Hold'em" className='lobby-topbar__logo-img' />
                    </Link>
                    <div className='lobby-topbar__account-actions'>
                        {!bIsSignedIn && (
                            <>
                            <form className='lobby-topbar__login lobby-topbar__login--connected' onSubmit={handleTopbarSignIn} aria-label='Sign in to your account'>
                                <input name='identifier' type='text' autoComplete='username' placeholder='Email or username' aria-label='Email or username' required disabled={bSigningIn} />
                                <input name='password' type='password' autoComplete='current-password' placeholder='Password' aria-label='Password' required disabled={bSigningIn} />
                                <button type='submit' className='lobby-topbar__auth-button lobby-topbar__auth-button--gold' disabled={bSigningIn}>{bSigningIn ? 'Signing in…' : 'Sign in'}</button>
                                <Link to='/register' className='lobby-topbar__auth-button'>Register</Link>
                            </form>
                                {sLoginError && <span className='lobby-topbar__login-error' role='alert'>{sLoginError}</span>}
                            </>
                        )}
                        {bIsSignedIn && <>
                        <button
                            type='button'
                            className={`lobby-topbar__bankroll${!bIsSignedIn ? ' lobby-topbar__bankroll--signed-out' : ''}`}
                            onClick={() => navigate('/lobby?tab=lobby-player-profile')}
                            aria-label={bIsSignedIn ? 'Open profile and stats' : 'Sign in'}
                        >
                            <span className='lobby-topbar__bankroll-avatar'>
                                <img
                                    src={sAvatarSrc}
                                    alt={profileData?.sUserName || 'Player'}
                                    onError={(e) => { e.currentTarget.src = getAvatarImageSrc('', profileData?.sUserName) }}
                                />
                            </span>
                            {bIsSignedIn ? (
                                <span className='lobby-topbar__bankroll-copy'>
                                    <span className='lobby-topbar__bankroll-name'>{_.appendSuffix(sDisplayName, 14)}</span>
                                    <span className='lobby-topbar__bankroll-amount'>{_.formatCurrencyWithComa(Number(profileData?.nChips) || 0)}</span>
                                </span>
                            ) : (
                                <span className='lobby-topbar__signin-message'>Please sign in</span>
                            )}
                        </button>
                        <button type='button' className='lobby-topbar__icon-action lobby-topbar__icon-action--shop' onClick={() => navigate('/lobby?tab=lobby-shop')} aria-label='Open shop'>
                            <img src={btnPlus} alt='' aria-hidden='true' />
                        </button>
                        <button type='button' className='lobby-topbar__icon-action lobby-topbar__icon-action--settings' onClick={() => navigate('/lobby?tab=lobby-settings')} aria-label='Open settings'>
                            <img src={btnSettings} alt='' aria-hidden='true' />
                        </button>
                        </>}
                    </div>
                </div>}
            <div className={`main-container ${width ? !isOpen && 'active' : isOpen && 'active'}`}>
                <div className='container-fluid'>
                    {/* <Breadcrumbs /> */}
                    <Suspense fallback={
                        <div className='d-flex align-items-center justify-content-center top-0 left-0 position-fixed h-100 w-100'>
                            <Spinner animation='border' size='sm' variant='success' />
                        </div>
                    }>
                        {children}
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
MainLayout.propTypes = {
    children: PropTypes.node.isRequired
}
export default MainLayout
