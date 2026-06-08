import { memo, useCallback, useEffect, useState } from 'react'
import { FiArrowLeft, FiSun } from 'react-icons/fi'
import { ROUTE_TRANSITION_EVENT } from '../../constants/routeTransition'
import { birdImage, cloudImages } from '../../data/continents'
import { eiridorMapImage, eiridorMapSize, eiridorRegions } from '../../data/eiridor'
import { buildHitboxPath } from '../../utils/mapHitbox'
import styles from './Eiridor.module.scss'

const WORLD_NAVIGATION_DELAY = 1150
const WORLD_TRANSITION_OPENING_DURATION = 1100
const REGION_NAVIGATION_DELAY = 1150
const REGION_TRANSITION_OPENING_DURATION = 1100
const CLOUDS = [
  { image: 0, x: -8, y: -18, scale: 0.78, duration: 108, delay: -18, driftX: 25, driftY: 3, opacity: 0.18 },
  { image: 3, x: 18, y: -13, scale: 0.68, duration: 134, delay: -58, driftX: -20, driftY: 5, opacity: 0.16 },
  { image: 1, x: 57, y: -16, scale: 0.82, duration: 118, delay: -36, driftX: 24, driftY: -3, opacity: 0.17 },
  { image: 6, x: -12, y: 28, scale: 0.74, duration: 146, delay: -72, driftX: 28, driftY: -5, opacity: 0.15 },
  { image: 4, x: 38, y: 30, scale: 0.7, duration: 116, delay: -31, driftX: -18, driftY: 4, opacity: 0.14 },
  { image: 2, x: 73, y: 24, scale: 0.68, duration: 152, delay: -88, driftX: 18, driftY: 3, opacity: 0.15 },
  { image: 5, x: 16, y: 62, scale: 0.78, duration: 138, delay: -50, driftX: -24, driftY: -4, opacity: 0.13 },
]

const BIRD_FLOCKS = [
  {
    id: 'ridge',
    className: 'birdFlockPrimary',
    y: 33,
    duration: 218,
    delay: -46,
    birds: [
      { x: 0, y: 18, scale: 0.66, rotate: -5 },
      { x: 36, y: 5, scale: 0.52, rotate: 3 },
      { x: 70, y: 28, scale: 0.56, rotate: -8 },
      { x: 108, y: 10, scale: 0.44, rotate: 7 },
      { x: 142, y: 36, scale: 0.5, rotate: -2 },
    ],
  },
  {
    id: 'southern',
    className: 'birdFlockSecondary',
    y: 57,
    duration: 244,
    delay: -100,
    birds: [
      { x: 0, y: 8, scale: 0.48, rotate: 4 },
      { x: 34, y: 30, scale: 0.58, rotate: -6 },
      { x: 70, y: 14, scale: 0.46, rotate: 9 },
      { x: 110, y: 42, scale: 0.52, rotate: -4 },
      { x: 146, y: 22, scale: 0.42, rotate: 6 },
    ],
  },
]
const QUALITY_STORAGE_KEY = 'eiridor-map-quality'
const QUALITY_MODES = [
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'performance', label: 'Performance' },
]
const QUALITY_BODY_CLASSES = QUALITY_MODES.map((mode) => `quality-${mode.id}`)

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

const RegionLayer = memo(function RegionLayer({ hitbox, onEnterRegion, region }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onEnterRegion(region.id)
    }
  }

  return (
    <g
      className={styles.region}
      style={{
        '--region-glow': region.glowColor,
        '--region-glow-fill': region.glowFill,
        '--region-glow-opacity': region.glowOpacity,
        '--region-glow-strength': region.glowStrength,
        '--region-float-delay': region.floatDelay,
      }}
    >
      <title>{region.name}</title>
      <g className={styles.regionFloat}>
        <g className={styles.regionLift}>
          {hitbox && <path className={styles.regionGlow} d={hitbox} />}
          <image
            className={styles.regionImage}
            href={region.image}
            width={eiridorMapSize.width}
            height={eiridorMapSize.height}
            loading="lazy"
            decoding="async"
          />
        </g>
      </g>
      {hitbox && (
        <path
          className={styles.regionHitbox}
          data-region-id={region.id}
          d={hitbox}
          role="button"
          aria-label={region.name}
          tabIndex="0"
          focusable="true"
          onClick={() => onEnterRegion(region.id)}
          onKeyDown={handleKeyDown}
        />
      )}
    </g>
  )
})

function Eiridor() {
  const [hitboxes, setHitboxes] = useState({})
  const [quality, setQuality] = useState(getInitialQuality)
  const [isQualityOpen, setIsQualityOpen] = useState(false)
  const [isReturningToWorld, setIsReturningToWorld] = useState(false)
  const [isEnteringRegion, setIsEnteringRegion] = useState(false)

  const enterRegion = useCallback(
    (regionId) => {
      if (isEnteringRegion) {
        return
      }

      setIsEnteringRegion(true)
      window.dispatchEvent(new CustomEvent(ROUTE_TRANSITION_EVENT, {
        detail: {
          to: `/region/${regionId}`,
          navigationDelay: REGION_NAVIGATION_DELAY,
          openingDuration: REGION_TRANSITION_OPENING_DURATION,
        },
      }))
    },
    [isEnteringRegion],
  )

  useEffect(() => {
    let isMounted = true

    async function createHitboxes() {
      const entries = await Promise.all(
        eiridorRegions.map(async (region) => [
          region.id,
          await buildHitboxPath(region.image),
        ]),
      )

      if (isMounted) {
        setHitboxes(Object.fromEntries(entries))
      }
    }

    createHitboxes()

    return () => {
      isMounted = false
    }
  }, [])

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

  const closeQualityPanelOnBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsQualityOpen(false)
    }
  }

  const returnToWorld = () => {
    if (isReturningToWorld) {
      return
    }

    setIsReturningToWorld(true)
    window.dispatchEvent(new CustomEvent(ROUTE_TRANSITION_EVENT, {
      detail: {
        to: '/',
        navigationDelay: WORLD_NAVIGATION_DELAY,
        openingDuration: WORLD_TRANSITION_OPENING_DURATION,
      },
    }))
  }

  return (
    <section className={styles.page}>
      <div className={styles.mapStage}>
        <svg
          className={styles.map}
          viewBox={`0 0 ${eiridorMapSize.width} ${eiridorMapSize.height}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="Eiridor continent map"
        >
          <g>
            <image
              className={styles.baseMap}
              href={eiridorMapImage}
              width={eiridorMapSize.width}
              height={eiridorMapSize.height}
              fetchPriority="high"
              decoding="async"
            />
          </g>

          {eiridorRegions.map((region) => (
            <RegionLayer
              key={region.id}
              hitbox={hitboxes[region.id]}
              onEnterRegion={enterRegion}
              region={region}
            />
          ))}

          <foreignObject
            className={styles.atmosphereLayer}
            x="0"
            y="0"
            width={eiridorMapSize.width}
            height={eiridorMapSize.height}
            aria-hidden="true"
          >
            <div className={styles.atmosphere}>
              {/*
              <div className={styles.oceanCurrent} />
              <div className={styles.waterShimmer} />
              <div className={styles.lightSweeps} />
              */}
              <div className={styles.birdLayer}>
                {BIRD_FLOCKS.map((flock) => (
                  <div
                    key={flock.id}
                    className={`${styles.birdFlock} ${styles[flock.className]}`}
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
              <div className={styles.cloudImages}>
                {CLOUDS.map((cloud, index) => (
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
              <div className={styles.lowMist} />
              <div className={styles.highMist} />
              <div className={styles.emberGrade} />
              <div className={styles.vignette} />
            </div>
          </foreignObject>

          <g className={styles.capitalOverlayLayer} aria-hidden="true">
            {eiridorRegions.map((region) => (
              <foreignObject
                key={`capital-${region.id}`}
                data-region-id={region.id}
                className={styles.capitalOverlay}
                x={region.label.x}
                y={region.label.y}
                width={region.label.width}
                height={region.label.height}
              >
                <div
                  className={styles.capitalBadge}
                  style={{
                    '--capital-size': `${region.label.size}px`,
                  }}
                >
                  <span className={styles.capitalName}>{region.capitalName}</span>
                </div>
              </foreignObject>
            ))}
          </g>
        </svg>
        <button
          className={styles.backButton}
          type="button"
          aria-label="Back to world map"
          disabled={isReturningToWorld}
          onClick={returnToWorld}
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
            aria-label="Eiridor quality settings"
            aria-expanded={isQualityOpen}
            onClick={() => setIsQualityOpen((current) => !current)}
          >
            <FiSun aria-hidden="true" />
          </button>
          <div className={styles.qualityMenu} aria-label="Eiridor quality">
            <span className={styles.qualityTitle}>Eiridor Quality</span>
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
      </div>
    </section>
  )
}

export default Eiridor
