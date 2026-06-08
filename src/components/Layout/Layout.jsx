import { useEffect, useRef, useState } from 'react'
import { FiInfo, FiX } from 'react-icons/fi'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_TRANSITION_EVENT } from '../../constants/routeTransition'
import FogTransition from '../FogTransition/FogTransition'
import styles from './Layout.module.scss'
import beerIconUrl from '../../../svg/infopanel/beer_mug_transparent.svg'
import churchIconUrl from '../../../svg/infopanel/cross2.svg'
import forgeIconUrl from '../../../svg/infopanel/forge_icon.svg'
import marketIconUrl from '../../../svg/infopanel/market_scales.svg'
import monasteryIconUrl from '../../../svg/infopanel/monastery_shield.svg'

const DEFAULT_NAVIGATION_DELAY = 1150
const DEFAULT_OPENING_DURATION = 1100
const LEGEND_ITEMS = [
  { icon: beerIconUrl, label: 'бар' },
  { icon: churchIconUrl, label: 'церковь' },
  { icon: forgeIconUrl, label: 'кузня' },
  { icon: marketIconUrl, label: 'рынок' },
  { icon: monasteryIconUrl, label: 'монастырь' },
]

function Layout() {
  const [transitionMode, setTransitionMode] = useState('idle')
  const [transitionVariant, setTransitionVariant] = useState('clouds')
  const [isLegendOpen, setIsLegendOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isShrineRoute = location.pathname === '/shrine'
  const legendRef = useRef(null)
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
      setTransitionVariant('clouds')
      setTransitionMode('idle')
    }

    const startRouteTransition = (event) => {
      const {
        to,
        navigationDelay = DEFAULT_NAVIGATION_DELAY,
        openingDuration = DEFAULT_OPENING_DURATION,
        variant = 'clouds',
      } = event.detail ?? {}

      if (!to) {
        return
      }

      if (to === '/shrine') {
        setIsLegendOpen(false)
      }

      clearTransitionTimeouts()
      targetPathRef.current = to
      openingDurationRef.current = openingDuration
      hasNavigatedRef.current = false
      setTransitionVariant(variant)
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
      setTransitionVariant('clouds')
      setTransitionMode('idle')
    }, openingDurationRef.current)

    return () => {
      window.clearTimeout(cleanupTimeoutRef.current)
    }
  }, [transitionMode, location.pathname])

  useEffect(() => {
    if (!isLegendOpen) {
      return undefined
    }

    const closeLegend = (event) => {
      if (legendRef.current?.contains(event.target)) {
        return
      }

      setIsLegendOpen(false)
    }

    const closeLegendOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsLegendOpen(false)
      }
    }

    window.addEventListener('pointerdown', closeLegend)
    window.addEventListener('keydown', closeLegendOnEscape)

    return () => {
      window.removeEventListener('pointerdown', closeLegend)
      window.removeEventListener('keydown', closeLegendOnEscape)
    }
  }, [isLegendOpen])

  const closeLegendOnBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsLegendOpen(false)
    }
  }

  return (
    <div className={styles.layout}>
      {!isShrineRoute && <div
        ref={legendRef}
        className={`${styles.legend} ${isLegendOpen ? styles.legendOpen : ''}`}
        onBlur={closeLegendOnBlur}
      >
        <button
          className={styles.legendToggle}
          type="button"
          aria-label={isLegendOpen ? 'Закрыть легенду карты' : 'Открыть легенду карты'}
          aria-expanded={isLegendOpen}
          aria-controls="map-legend"
          onClick={() => setIsLegendOpen((current) => !current)}
        >
          {isLegendOpen ? <FiX aria-hidden="true" /> : <FiInfo aria-hidden="true" />}
        </button>
        <div
          id="map-legend"
          className={styles.legendPanel}
          aria-hidden={!isLegendOpen}
          aria-label="Легенда карты"
        >
          <span className={styles.legendTitle}>Легенда</span>
          <ul className={styles.legendList}>
            {LEGEND_ITEMS.map((item) => (
              <li key={item.icon} className={styles.legendItem}>
                <img className={styles.legendIcon} src={item.icon} alt="" />
                <span className={styles.legendDash}>-</span>
                <span className={styles.legendLabel}>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>}
      <main className={styles.main}>
        <Outlet />
      </main>
      {transitionMode !== 'idle' && <FogTransition mode={transitionMode} variant={transitionVariant} />}
    </div>
  )
}

export default Layout
