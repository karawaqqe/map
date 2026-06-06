import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import FogTransition from '../FogTransition/FogTransition'
import styles from './Layout.module.scss'

const ROUTE_TRANSITION_EVENT = 'map-route-transition'
const DEFAULT_NAVIGATION_DELAY = 1150
const DEFAULT_OPENING_DURATION = 1100

function Layout() {
  const [transitionMode, setTransitionMode] = useState('idle')
  const location = useLocation()
  const navigate = useNavigate()
  const navigationTimeoutRef = useRef(null)
  const cleanupTimeoutRef = useRef(null)
  const fallbackTimeoutRef = useRef(null)
  const openingDurationRef = useRef(DEFAULT_OPENING_DURATION)
  const targetPathRef = useRef(null)
  const hasNavigatedRef = useRef(false)

  useEffect(() => {
    const clearTransitionTimeouts = () => {
      window.clearTimeout(navigationTimeoutRef.current)
      window.clearTimeout(cleanupTimeoutRef.current)
      window.clearTimeout(fallbackTimeoutRef.current)
    }

    const endRouteTransition = () => {
      clearTransitionTimeouts()
      targetPathRef.current = null
      hasNavigatedRef.current = false
      setTransitionMode('idle')
    }

    const startRouteTransition = (event) => {
      const {
        to,
        navigationDelay = DEFAULT_NAVIGATION_DELAY,
        openingDuration = DEFAULT_OPENING_DURATION,
      } = event.detail ?? {}

      if (!to) {
        return
      }

      clearTransitionTimeouts()
      targetPathRef.current = to
      openingDurationRef.current = openingDuration
      hasNavigatedRef.current = false
      setTransitionMode('closing')

      navigationTimeoutRef.current = window.setTimeout(() => {
        hasNavigatedRef.current = true
        navigate(to)
        setTransitionMode('opening')

        cleanupTimeoutRef.current = window.setTimeout(() => {
          endRouteTransition()
        }, openingDuration)
      }, navigationDelay)

      fallbackTimeoutRef.current = window.setTimeout(() => {
        endRouteTransition()
      }, navigationDelay + openingDuration + 1200)
    }

    window.addEventListener(ROUTE_TRANSITION_EVENT, startRouteTransition)

    return () => {
      clearTransitionTimeouts()
      window.removeEventListener(ROUTE_TRANSITION_EVENT, startRouteTransition)
    }
  }, [navigate])

  useEffect(() => {
    if (transitionMode === 'idle' || !hasNavigatedRef.current || location.pathname !== targetPathRef.current) {
      return undefined
    }

    setTransitionMode('opening')
    window.clearTimeout(cleanupTimeoutRef.current)
    cleanupTimeoutRef.current = window.setTimeout(() => {
      window.clearTimeout(navigationTimeoutRef.current)
      window.clearTimeout(cleanupTimeoutRef.current)
      window.clearTimeout(fallbackTimeoutRef.current)
      targetPathRef.current = null
      hasNavigatedRef.current = false
      setTransitionMode('idle')
    }, openingDurationRef.current)

    return () => {
      window.clearTimeout(cleanupTimeoutRef.current)
    }
  }, [transitionMode, location.pathname])

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <Outlet />
      </main>
      {transitionMode !== 'idle' && <FogTransition mode={transitionMode} />}
    </div>
  )
}

export default Layout
export { ROUTE_TRANSITION_EVENT }
