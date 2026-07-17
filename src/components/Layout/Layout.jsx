import { useEffect, useRef, useState } from 'react'
import { FiInfo, FiX } from 'react-icons/fi'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import LoadingScreen from '../LoadingScreen/LoadingScreen'
import { ROUTE_TRANSITION_EVENT } from '../../constants/routeTransition'
import { getRouteLoadingTarget } from '../../data/routeLoadingAssets'
import { preloadAssets } from '../../utils/assetPreloader'
import FogTransition from '../FogTransition/FogTransition'
import styles from './Layout.module.scss'
import beerIconUrl from '../../../svg/infopanel/beer_mug_transparent.svg'
import churchIconUrl from '../../../svg/infopanel/cross2.svg'
import forgeIconUrl from '../../../svg/infopanel/forge_icon.svg'
import marketIconUrl from '../../../svg/infopanel/market_scales.svg'
import monasteryIconUrl from '../../../svg/infopanel/monastery_shield.svg'

const DEFAULT_NAVIGATION_DELAY = 1150
const DEFAULT_OPENING_DURATION = 1100
const LEGEND_HIDDEN_ROUTES = ['/', '/eiridor', '/holy-light', '/shrine', '/spindel', '/spindel/room', '/spindel/edar-voss-journal']
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
  const [loadingState, setLoadingState] = useState({
    label: 'Location',
    progress: 0,
    visible: false,
  })
  const location = useLocation()
  const navigate = useNavigate()
  const hidesLegend = LEGEND_HIDDEN_ROUTES.includes(location.pathname)
  const legendRef = useRef(null)
  const navigationTimeoutRef = useRef(null)
  const cleanupTimeoutRef = useRef(null)
  const fallbackTimeoutRef = useRef(null)
  const openingDurationRef = useRef(DEFAULT_OPENING_DURATION)
  const targetPathRef = useRef(null)
  const hasNavigatedRef = useRef(false)
  const initialPathRef = useRef(location.pathname)
  const loadingRunRef = useRef(0)

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
      setLoadingState((currentState) => ({
        ...currentState,
        visible: false,
      }))
      setTransitionVariant('clouds')
      setTransitionMode('idle')
    }

    const startLoading = (loadingPath, runId) => {
      const { assets, label } = getRouteLoadingTarget(loadingPath)

      if (!assets.length) {
        setLoadingState({
          label,
          progress: 1,
          visible: false,
        })
        return Promise.resolve()
      }

      setLoadingState({
        label,
        progress: 0,
        visible: true,
      })

      return preloadAssets(assets, (progress) => {
        if (loadingRunRef.current !== runId) {
          return
        }

        setLoadingState({
          label,
          progress,
          visible: true,
        })
      }).then(() => {
        if (loadingRunRef.current === runId) {
          setLoadingState({
            label,
            progress: 1,
            visible: true,
          })
        }
      })
    }

    const startRouteTransition = (event) => {
      const {
        loadingPath,
        to,
        onTransitionPoint,
        navigationDelay = DEFAULT_NAVIGATION_DELAY,
        openingDuration = DEFAULT_OPENING_DURATION,
        variant = 'clouds',
      } = event.detail ?? {}

      if (!to && typeof onTransitionPoint !== 'function') {
        return
      }

      const transitionRunId = loadingRunRef.current + 1
      loadingRunRef.current = transitionRunId

      if (LEGEND_HIDDEN_ROUTES.includes(to)) {
        setIsLegendOpen(false)
      }

      clearTransitionTimeouts()
      targetPathRef.current = to
      openingDurationRef.current = openingDuration
      hasNavigatedRef.current = false
      setTransitionVariant(variant)
      setTransitionMode('closing')

      const delayPromise = new Promise((resolve) => {
        navigationTimeoutRef.current = window.setTimeout(resolve, navigationDelay)
      })
      const loadingPromise = loadingPath || to
        ? startLoading(loadingPath ?? to, transitionRunId)
        : Promise.resolve()

      Promise.all([delayPromise, loadingPromise]).then(() => {
        if (loadingRunRef.current !== transitionRunId) {
          return
        }

        onTransitionPoint?.()

        if (to) {
          hasNavigatedRef.current = true
          navigate(to)
        }

        setTransitionMode('opening')

        cleanupTimeoutRef.current = window.setTimeout(() => {
          endRouteTransition()
        }, openingDuration)
      })

      fallbackTimeoutRef.current = window.setTimeout(() => {
        endRouteTransition()
      }, navigationDelay + openingDuration + 28000)
    }

    window.addEventListener(ROUTE_TRANSITION_EVENT, startRouteTransition)

    return () => {
      clearTransitionTimeouts()
      window.removeEventListener(ROUTE_TRANSITION_EVENT, startRouteTransition)
    }
  }, [navigate])

  useEffect(() => {
    const initialRunId = loadingRunRef.current + 1
    loadingRunRef.current = initialRunId
    const { assets, label } = getRouteLoadingTarget(initialPathRef.current)

    if (!assets.length) {
      return undefined
    }

    let hideTimeoutId = null
    setLoadingState({
      label,
      progress: 0,
      visible: true,
    })

    preloadAssets(assets, (progress) => {
      if (loadingRunRef.current !== initialRunId) {
        return
      }

      setLoadingState({
        label,
        progress,
        visible: true,
      })
    }).then(() => {
      if (loadingRunRef.current !== initialRunId) {
        return
      }

      setLoadingState({
        label,
        progress: 1,
        visible: true,
      })

      hideTimeoutId = window.setTimeout(() => {
        if (loadingRunRef.current === initialRunId) {
          setLoadingState((currentState) => ({
            ...currentState,
            visible: false,
          }))
        }
      }, 220)
    })

    return () => {
      window.clearTimeout(hideTimeoutId)
    }
  }, [])

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
      {!hidesLegend && <div
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
      <LoadingScreen
        label={loadingState.label}
        progress={loadingState.progress}
        visible={loadingState.visible}
      />
    </div>
  )
}

export default Layout
