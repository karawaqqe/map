import { useCallback, useEffect, useRef, useState } from 'react'
import { FiArrowLeft, FiMinus, FiPlus, FiSliders } from 'react-icons/fi'
import { useParams } from 'react-router-dom'
import { ROUTE_TRANSITION_EVENT } from '../../constants/routeTransition'
import styles from './RegionMap.module.scss'
import drakenholmMapImage from '../../../img/continents/Regions/Eiridor/Drakenholm/Untitled23_20260607205818.png'
import birdImage from '../../../img/bird/newbird.png'
import birdSound from '../../../sounds/birds/birdsound.mp3'
import cloud1 from '../../../img/clouds/cloud1.png'
import cloud2 from '../../../img/clouds/cloud2.png'
import cloud3 from '../../../img/clouds/cloud3.png'
import cloud4 from '../../../img/clouds/cloud4.png'
import cloud5 from '../../../img/clouds/cloud5.png'
import cloud6 from '../../../img/clouds/cloud6.png'
import cloud7 from '../../../img/clouds/cloud7.png'
import churchIcon from '../../../svg/Eiridor/Church/cross3.svg'
import tavernIcon from '../../../svg/Eiridor/Bar/drakenholm_tavern_icon.svg'
import forgeIcon from '../../../svg/Eiridor/Forge/forge_transparent.svg'
import marketIcon from '../../../svg/Eiridor/Market/market_scalesdrakenholm.svg'

const MIN_ZOOM = 1
const MAX_VISIBLE_AREA_PERCENT = 20
const MAX_ZOOM = 100 / MAX_VISIBLE_AREA_PERCENT
const INITIAL_ZOOM = 2.35
const INITIAL_FOCUS = { x: 0.49, y: 0.47 }
const ZOOM_STEP = 0.35
const EIRIDOR_NAVIGATION_DELAY = 1150
const EIRIDOR_TRANSITION_OPENING_DURATION = 1100
const BIRD_SOUND_MIN_DELAY = 7000
const BIRD_SOUND_MAX_DELAY = 19000
const QUALITY_STORAGE_KEY = 'region-map-quality'
const QUALITY_MODES = [
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'performance', label: 'Performance' },
]
const QUALITY_BODY_CLASSES = QUALITY_MODES.map((mode) => `quality-${mode.id}`)
const DRAKENHOLM_MARKERS = [
  { id: 'marker-01', type: 'tavern', x: 10.9527, y: 11.9960 },
  { id: 'marker-02', type: 'tavern', x: 54.4894, y: 14.1379 },
  { id: 'marker-03', type: 'tavern', x: 21.8572, y: 18.9043 },
  { id: 'marker-04', type: 'tavern', x: 89.5741, y: 19.4590 },
  { id: 'marker-05', type: 'church', x: 20.0306, y: 19.7089 },
  { id: 'marker-06', type: 'tavern', x: 41.9741, y: 19.9367 },
  { id: 'marker-07', type: 'tavern', x: 65.3796, y: 26.4884 },
  { id: 'marker-08', type: 'tavern', x: 61.9278, y: 32.4340 },
  { id: 'marker-09', type: 'church', x: 42.1230, y: 33.8962 },
  { id: 'marker-10', type: 'tavern', x: 40.7727, y: 35.7863 },
  { id: 'marker-11', type: 'tavern', x: 50.1007, y: 39.8224 },
  { id: 'marker-12', type: 'tavern', x: 46.7117, y: 41.6331 },
  { id: 'marker-13', type: 'church', x: 66.2416, y: 41.6331 },
  { id: 'marker-14', type: 'tavern', x: 54.0396, y: 43.2712 },
  { id: 'marker-15', type: 'tavern', x: 23.3941, y: 43.3474 },
  { id: 'marker-16', type: 'church', x: 49.6007, y: 43.3993 },
  { id: 'marker-17', type: 'tavern', x: 39.0348, y: 44.1310 },
  { id: 'marker-18', type: 'tavern', x: 86.5841, y: 46.4718 },
  { id: 'marker-19', type: 'tavern', x: 51.7646, y: 46.4751 },
  { id: 'marker-20', type: 'tavern', x: 45.9742, y: 47.3827 },
  { id: 'marker-21', type: 'tavern', x: 79.8200, y: 48.0343 },
  { id: 'marker-22', type: 'tavern', x: 12.8294, y: 50.3549 },
  { id: 'marker-23', type: 'tavern', x: 47.7762, y: 50.7847 },
  { id: 'marker-24', type: 'tavern', x: 51.5766, y: 52.6222 },
  { id: 'marker-25', type: 'church', x: 61.4785, y: 56.4024 },
  { id: 'marker-26', type: 'church', x: 35.7096, y: 56.7313 },
  { id: 'marker-27', type: 'tavern', x: 93.4737, y: 57.0562 },
  { id: 'marker-28', type: 'tavern', x: 54.1260, y: 58.9466 },
  { id: 'marker-29', type: 'tavern', x: 70.6562, y: 61.6955 },
  { id: 'marker-30', type: 'tavern', x: 58.4164, y: 66.5578 },
  { id: 'marker-31', type: 'church', x: 37.2343, y: 68.7500 },
  { id: 'marker-32', type: 'tavern', x: 38.9984, y: 69.6081 },
  { id: 'marker-33', type: 'tavern', x: 52.1255, y: 70.1865 },
  { id: 'marker-34', type: 'tavern', x: 89.0846, y: 71.8495 },
  { id: 'marker-35', type: 'tavern', x: 11.7540, y: 74.0686 },
  { id: 'marker-36', type: 'church', x: 64.7918, y: 74.9772 },
  { id: 'marker-37', type: 'tavern', x: 67.6165, y: 75.7837 },
  { id: 'marker-38', type: 'church', x: 12.0916, y: 76.6149 },
  { id: 'marker-39', type: 'tavern', x: 78.8840, y: 79.3130 },
  { id: 'marker-40', type: 'tavern', x: 33.4209, y: 80.7712 },
  { id: 'marker-41', type: 'tavern', x: 50.3632, y: 84.8298 },
  { id: 'marker-42', type: 'tavern', x: 17.7169, y: 88.8357 },
  { id: 'marker-43', type: 'forge', x: 44.8260, y: 18.7261 },
  { id: 'marker-44', type: 'forge', x: 93.3887, y: 21.3277 },
  { id: 'marker-45', type: 'market', x: 21.3510, y: 23.1261 },
  { id: 'marker-46', type: 'market', x: 54.8142, y: 28.9785 },
  { id: 'marker-47', type: 'market', x: 45.4021, y: 43.7533 },
  { id: 'marker-48', type: 'forge', x: 20.4133, y: 45.7765 },
  { id: 'marker-49', type: 'forge', x: 49.6512, y: 54.4243 },
  { id: 'marker-50', type: 'forge', x: 47.3137, y: 72.1513 },
  { id: 'marker-51', type: 'forge', x: 11.7768, y: 72.8254, offsetX: 3.75, offsetY: 2.5 },
]
const MARKER_ICONS = {
  church: churchIcon,
  forge: forgeIcon,
  market: marketIcon,
  tavern: tavernIcon,
}
const MARKER_LABELS = {
  church: 'Church',
  forge: 'Forge',
  market: 'Market',
  tavern: 'Tavern',
}
const REGION_MAPS = {
  drakenholm: {
    image: drakenholmMapImage,
    markers: DRAKENHOLM_MARKERS,
    name: 'Drakenholm',
  },
}
const cloudImages = [cloud1, cloud2, cloud3, cloud4, cloud5, cloud6, cloud7]
const CINEMATIC_CLOUDS = [
  { image: 0, x: 6, y: 9, scale: 0.84, duration: 132, delay: -24, driftX: 18, driftY: 2, opacity: 0.44 },
  { image: 3, x: 28, y: 21, scale: 0.76, duration: 156, delay: -70, driftX: -14, driftY: -3, opacity: 0.38 },
  { image: 5, x: 48, y: 7, scale: 0.88, duration: 148, delay: -48, driftX: 16, driftY: 4, opacity: 0.34 },
  { image: 2, x: 67, y: 34, scale: 0.72, duration: 170, delay: -108, driftX: -12, driftY: 3, opacity: 0.32 },
  { image: 6, x: 82, y: 16, scale: 0.78, duration: 142, delay: -92, driftX: 13, driftY: -2, opacity: 0.34 },
]
const CINEMATIC_BIRD_FLOCKS = [
  {
    id: 'north-wall',
    y: 24,
    duration: 162,
    delay: -28,
    birds: [
      { x: 0, y: 11, scale: 0.38, rotate: -5 },
      { x: 28, y: 2, scale: 0.32, rotate: 3 },
      { x: 55, y: 18, scale: 0.34, rotate: -7 },
      { x: 88, y: 7, scale: 0.28, rotate: 6 },
    ],
  },
  {
    id: 'southern-road',
    y: 58,
    duration: 188,
    delay: -86,
    birds: [
      { x: 0, y: 8, scale: 0.3, rotate: 4 },
      { x: 24, y: 23, scale: 0.35, rotate: -6 },
      { x: 54, y: 12, scale: 0.28, rotate: 8 },
      { x: 82, y: 28, scale: 0.3, rotate: -4 },
    ],
  },
]

function getInitialQuality() {
  if (typeof window === 'undefined') {
    return 'cinematic'
  }

  let storedQuality = null

  try {
    storedQuality = window.localStorage.getItem(QUALITY_STORAGE_KEY)
  } catch {
    storedQuality = null
  }

  return QUALITY_MODES.some((mode) => mode.id === storedQuality) ? storedQuality : 'cinematic'
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getPanLimit(stage, surface, zoom) {
  if (!stage || !surface) {
    return { x: 0, y: 0 }
  }

  return {
    x: Math.max(0, (surface.clientWidth * zoom - stage.clientWidth) / 2),
    y: Math.max(0, (surface.clientHeight * zoom - stage.clientHeight) / 2),
  }
}

function clampPan(pan, zoom, stage, surface) {
  const limit = getPanLimit(stage, surface, zoom)

  return {
    x: clamp(pan.x, -limit.x, limit.x),
    y: clamp(pan.y, -limit.y, limit.y),
  }
}

function getFocusedPan(stage, surface, zoom, focus = INITIAL_FOCUS) {
  if (!stage || !surface) {
    return { x: 0, y: 0 }
  }

  return clampPan({
    x: -(focus.x - 0.5) * surface.clientWidth * zoom,
    y: -(focus.y - 0.5) * surface.clientHeight * zoom,
  }, zoom, stage, surface)
}

function RegionMap({ parentName = 'Eiridor', parentRoute = '/eiridor' }) {
  const { regionId } = useParams()
  const stageRef = useRef(null)
  const mapSurfaceRef = useRef(null)
  const dragRef = useRef(null)
  const birdAudioRef = useRef(null)
  const hasInitialCameraRef = useRef(false)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [quality, setQuality] = useState(getInitialQuality)
  const [isQualityOpen, setIsQualityOpen] = useState(false)
  const [isReturningToParent, setIsReturningToParent] = useState(false)
  const region = REGION_MAPS[regionId]

  const setStageElement = useCallback((node) => {
    stageRef.current = node
  }, [])

  const setMapSurfaceElement = useCallback((node) => {
    mapSurfaceRef.current = node
  }, [])

  useEffect(() => {
    const syncCameraBounds = () => {
      const stage = stageRef.current
      const surface = mapSurfaceRef.current

      if (!stage || !surface) {
        return
      }

      setPan((currentPan) => {
        if (!hasInitialCameraRef.current) {
          hasInitialCameraRef.current = true
          return getFocusedPan(stage, surface, INITIAL_ZOOM)
        }

        return clampPan(currentPan, zoom, stage, surface)
      })
    }

    syncCameraBounds()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', syncCameraBounds)

      return () => {
        window.removeEventListener('resize', syncCameraBounds)
      }
    }

    const observer = new ResizeObserver(syncCameraBounds)
    const stage = stageRef.current
    const surface = mapSurfaceRef.current

    if (stage) {
      observer.observe(stage)
    }

    if (surface) {
      observer.observe(surface)
    }

    return () => {
      observer.disconnect()
    }
  }, [region, zoom])

  useEffect(() => {
    document.body.classList.remove(...QUALITY_BODY_CLASSES)
    document.body.classList.add(`quality-${quality}`)

    try {
      window.localStorage.setItem(QUALITY_STORAGE_KEY, quality)
    } catch {
      // Quality still applies for this session if storage is unavailable.
    }

    return () => {
      document.body.classList.remove(...QUALITY_BODY_CLASSES)
    }
  }, [quality])

  useEffect(() => {
    const audio = birdAudioRef.current

    if (!audio || quality !== 'cinematic') {
      return undefined
    }

    let timeoutId
    let isCancelled = false

    audio.volume = 0.14

    const getNextDelay = () => (
      BIRD_SOUND_MIN_DELAY + Math.random() * (BIRD_SOUND_MAX_DELAY - BIRD_SOUND_MIN_DELAY)
    )

    const scheduleBirdSound = () => {
      timeoutId = window.setTimeout(() => {
        if (isCancelled) {
          return
        }

        audio.currentTime = 0
        audio.play().catch(() => {})
        scheduleBirdSound()
      }, getNextDelay())
    }

    const startBirdSound = () => {
      window.clearTimeout(timeoutId)
      audio.currentTime = 0
      audio.play().catch(() => {})
      scheduleBirdSound()
    }

    window.addEventListener('pointerdown', startBirdSound, { once: true })
    window.addEventListener('keydown', startBirdSound, { once: true })
    scheduleBirdSound()

    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
      window.removeEventListener('pointerdown', startBirdSound)
      window.removeEventListener('keydown', startBirdSound)
      audio.pause()
    }
  }, [quality])

  const updateZoom = (nextZoom) => {
    setZoom((currentZoom) => {
      const resolvedZoom = clamp(
        typeof nextZoom === 'function' ? nextZoom(currentZoom) : nextZoom,
        MIN_ZOOM,
        MAX_ZOOM,
      )

      setPan((currentPan) => (
        clampPan(currentPan, resolvedZoom, stageRef.current, mapSurfaceRef.current)
      ))

      return resolvedZoom
    })
  }

  const handlePointerDown = (event) => {
    if (!region) {
      return
    }

    const limit = getPanLimit(stageRef.current, mapSurfaceRef.current, zoom)

    if (!limit.x && !limit.y) {
      return
    }

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      pan,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!dragRef.current) {
      return
    }

    const nextPan = {
      x: dragRef.current.pan.x + event.clientX - dragRef.current.startX,
      y: dragRef.current.pan.y + event.clientY - dragRef.current.startY,
    }

    setPan(clampPan(nextPan, zoom, stageRef.current, mapSurfaceRef.current))
  }

  const handlePointerUp = () => {
    dragRef.current = null
  }

  const returnToParent = () => {
    if (isReturningToParent) {
      return
    }

    setIsReturningToParent(true)
    window.dispatchEvent(new CustomEvent(ROUTE_TRANSITION_EVENT, {
      detail: {
        to: parentRoute,
        navigationDelay: EIRIDOR_NAVIGATION_DELAY,
        openingDuration: EIRIDOR_TRANSITION_OPENING_DURATION,
      },
    }))
  }

  const closeQualityPanelOnBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsQualityOpen(false)
    }
  }

  if (!region) {
    return (
      <section className={styles.page}>
        <button
          className={styles.backButton}
          type="button"
          aria-label={`Back to ${parentName}`}
          disabled={isReturningToParent}
          onClick={returnToParent}
        >
          <FiArrowLeft aria-hidden="true" />
        </button>
        <h1>Region Map</h1>
        <p>{regionId}</p>
      </section>
    )
  }

  return (
    <section className={styles.page}>
      <div
        ref={setStageElement}
        className={styles.mapStage}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className={styles.mapLayer}>
          <div
            ref={setMapSurfaceElement}
            className={styles.mapSurface}
            style={{
              left: `calc(50% + ${pan.x}px)`,
              top: `calc(50% + ${pan.y}px)`,
              transform: `translate(-50%, -50%) scale(${zoom})`,
            }}
          >
            <img
              className={styles.regionMap}
              src={region.image}
              alt={`${region.name} region map`}
              draggable="false"
            />
            {quality === 'cinematic' && (
              <div className={styles.mapAtmosphere} aria-hidden="true">
                <div className={styles.fogLayer} />
                <div className={styles.cloudImages}>
                  {CINEMATIC_CLOUDS.map((cloud, index) => (
                    <img
                      key={`cloud-${index}`}
                      className={styles.cloudImage}
                      src={cloudImages[cloud.image]}
                      alt=""
                      style={{
                        '--cloud-x': `${cloud.x}%`,
                        '--cloud-y': `${cloud.y}%`,
                        '--cloud-scale': cloud.scale,
                        '--cloud-duration': `${cloud.duration}s`,
                        '--cloud-delay': `${cloud.delay}s`,
                        '--cloud-drift-x': `${cloud.driftX}%`,
                        '--cloud-drift-y': `${cloud.driftY}%`,
                        '--cloud-opacity': cloud.opacity,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div className={styles.mapMarkers}>
              {region.markers.map((marker) => (
                <img
                  key={marker.id}
                  className={`${styles.mapMarker} ${styles[`${marker.type}Marker`]}`}
                  src={MARKER_ICONS[marker.type]}
                  alt={MARKER_LABELS[marker.type]}
                  draggable="false"
                  tabIndex={0}
                  style={{
                    '--marker-x': `${marker.x + (marker.offsetX ?? 0)}%`,
                    '--marker-y': `${marker.y + (marker.offsetY ?? 0)}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {quality === 'cinematic' && (
        <>
          <audio ref={birdAudioRef} className={styles.ambientAudio} src={birdSound} preload="none" />
          <div className={styles.birdLayer} aria-hidden="true">
            {CINEMATIC_BIRD_FLOCKS.map((flock) => (
              <div
                key={flock.id}
                className={styles.birdFlock}
                style={{
                  '--flock-y': `${flock.y}%`,
                  '--flock-duration': `${flock.duration}s`,
                  '--flock-delay': `${flock.delay}s`,
                }}
              >
                {flock.birds.map((bird, index) => (
                  <img
                    key={`${flock.id}-${index}`}
                    className={styles.bird}
                    src={birdImage}
                    alt=""
                    style={{
                      '--bird-x': `${bird.x}px`,
                      '--bird-y': `${bird.y}px`,
                      '--bird-scale': bird.scale,
                      '--bird-rotate': `${bird.rotate}deg`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
      <button
        className={styles.backButton}
        type="button"
        aria-label={`Back to ${parentName}`}
        disabled={isReturningToParent}
        onClick={returnToParent}
      >
        <FiArrowLeft aria-hidden="true" />
      </button>
      <div
        className={`${styles.qualityPanel} ${isQualityOpen ? styles.qualityPanelOpen : ''}`}
        onMouseEnter={() => setIsQualityOpen(true)}
        onMouseLeave={() => setIsQualityOpen(false)}
        onFocus={() => setIsQualityOpen(true)}
        onBlur={closeQualityPanelOnBlur}
      >
        <button
          className={styles.qualityToggle}
          type="button"
          aria-label="Drakenholm quality settings"
          aria-expanded={isQualityOpen}
          onClick={() => setIsQualityOpen((current) => !current)}
        >
          <FiSliders aria-hidden="true" />
        </button>
        <div className={styles.qualityMenu} aria-label="Drakenholm quality">
          <span className={styles.qualityTitle}>Drakenholm Quality</span>
          <div className={styles.qualityOptions}>
            {QUALITY_MODES.map((mode) => (
              <button
                key={mode.id}
                className={`${styles.qualityOption} ${quality === mode.id ? styles.qualityOptionActive : ''}`}
                type="button"
                aria-pressed={quality === mode.id}
                onClick={() => {
                  setQuality(mode.id)
                  setIsQualityOpen(false)
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.cameraControls} aria-label="Camera zoom">
        <button
          className={styles.cameraButton}
          type="button"
          aria-label="Zoom out"
          disabled={zoom <= MIN_ZOOM}
          onClick={() => updateZoom((currentZoom) => currentZoom - ZOOM_STEP)}
        >
          <FiMinus aria-hidden="true" />
        </button>
        <span className={styles.regionName}>{region.name}</span>
        <button
          className={styles.cameraButton}
          type="button"
          aria-label="Zoom in"
          disabled={zoom >= MAX_ZOOM}
          onClick={() => updateZoom((currentZoom) => currentZoom + ZOOM_STEP)}
        >
          <FiPlus aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

export default RegionMap
