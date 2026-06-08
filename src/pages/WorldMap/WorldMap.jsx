import { useEffect, useRef, useState } from 'react'
import { FiSun } from 'react-icons/fi'
import { ROUTE_TRANSITION_EVENT } from '../../constants/routeTransition'
import { birdImage, birdSound, cloudImages, continents, mapSize, windSound, worldMapImage } from '../../data/continents'
import { buildHitboxPath } from '../../utils/mapHitbox'
import styles from './WorldMap.module.scss'

const EIRIDOR_CONTINENT_ID = 'eiridors'
const CONTINENT_ROUTES = {
  [EIRIDOR_CONTINENT_ID]: '/eiridor',
  holyLights: '/holy-light',
  spindel: '/shrine',
}
const CONTINENT_NAVIGATION_DELAY = 1150
const CONTINENT_TRANSITION_OPENING_DURATION = 1100
const TOP_SNOWFLAKES = [
  { x: 6, delay: -2, duration: 18, drift: 12 },
  { x: 14, delay: -9, duration: 22, drift: -10 },
  { x: 24, delay: -5, duration: 20, drift: 8 },
  { x: 38, delay: -14, duration: 24, drift: -14 },
  { x: 52, delay: -4, duration: 19, drift: 11 },
  { x: 67, delay: -11, duration: 23, drift: -8 },
  { x: 81, delay: -7, duration: 21, drift: 10 },
  { x: 93, delay: -16, duration: 25, drift: -12 },
]
const BOTTOM_SNOWFLAKES = [
  { x: 9, delay: -8, duration: 24, drift: -8 },
  { x: 21, delay: -1, duration: 20, drift: 10 },
  { x: 35, delay: -12, duration: 26, drift: -14 },
  { x: 48, delay: -6, duration: 22, drift: 9 },
  { x: 63, delay: -15, duration: 25, drift: -10 },
  { x: 79, delay: -4, duration: 21, drift: 12 },
  { x: 91, delay: -10, duration: 23, drift: -9 },
]
const WIND_SNOWFLAKES_TOP = [
  { x: 4, delay: -13, duration: 26, drift: 24 },
  { x: 18, delay: -18, duration: 28, drift: -22 },
  { x: 31, delay: -7, duration: 24, drift: 18 },
  { x: 44, delay: -21, duration: 30, drift: -26 },
  { x: 58, delay: -16, duration: 27, drift: 23 },
  { x: 72, delay: -3, duration: 25, drift: -18 },
  { x: 86, delay: -20, duration: 29, drift: 21 },
]
const CINEMATIC_SNOWFLAKES_TOP = [
  { x: 11, delay: -24, duration: 27, drift: 16 },
  { x: 29, delay: -31, duration: 32, drift: -20 },
  { x: 47, delay: -27, duration: 29, drift: 19 },
  { x: 64, delay: -35, duration: 34, drift: -17 },
  { x: 77, delay: -29, duration: 31, drift: 22 },
  { x: 96, delay: -33, duration: 36, drift: -18 },
]
const WIND_SNOWFLAKES_BOTTOM = [
  { x: 6, delay: -17, duration: 29, drift: 22 },
  { x: 17, delay: -5, duration: 25, drift: -18 },
  { x: 29, delay: -20, duration: 31, drift: 26 },
  { x: 42, delay: -11, duration: 27, drift: -23 },
  { x: 56, delay: -23, duration: 30, drift: 20 },
  { x: 71, delay: -9, duration: 26, drift: -21 },
  { x: 88, delay: -14, duration: 28, drift: 24 },
]
const CRYSTAL_SNOWFLAKES_BOTTOM = [
  { x: 13, delay: -26, duration: 35, drift: -35 },
  { x: 37, delay: -18, duration: 32, drift: 38 },
  { x: 61, delay: -30, duration: 37, drift: -31 },
  { x: 83, delay: -24, duration: 34, drift: 36 },
]
const CINEMATIC_SNOWFLAKES_BOTTOM = [
  { x: 4, delay: -32, duration: 35, drift: 28 },
  { x: 24, delay: -27, duration: 30, drift: -20 },
  { x: 46, delay: -36, duration: 38, drift: 24 },
  { x: 68, delay: -29, duration: 33, drift: -26 },
  { x: 87, delay: -39, duration: 40, drift: 22 },
  { x: 97, delay: -34, duration: 36, drift: -18 },
]
const TOP_SNOW = [
  ...TOP_SNOWFLAKES,
  ...WIND_SNOWFLAKES_TOP,
  ...CINEMATIC_SNOWFLAKES_TOP,
].slice(0, 21)
const BOTTOM_SNOW = [
  ...BOTTOM_SNOWFLAKES,
  ...WIND_SNOWFLAKES_BOTTOM,
  ...CRYSTAL_SNOWFLAKES_BOTTOM,
  ...CINEMATIC_SNOWFLAKES_BOTTOM,
].slice(0, 24)
const CLOUDS = [
  { image: 0, x: -9, y: -15, scale: 0.88, duration: 96, delay: -12, driftX: 30, driftY: 2, opacity: 0.25 },
  { image: 3, x: 20, y: -11, scale: 0.76, duration: 124, delay: -54, driftX: -24, driftY: 4, opacity: 0.21 },
  { image: 1, x: 58, y: -15, scale: 0.9, duration: 112, delay: -32, driftX: 27, driftY: -3, opacity: 0.24 },
  { image: 6, x: -12, y: 27, scale: 0.84, duration: 136, delay: -68, driftX: 32, driftY: -6, opacity: 0.22 },
  { image: 4, x: 36, y: 31, scale: 0.78, duration: 108, delay: -28, driftX: -22, driftY: 5, opacity: 0.19 },
  { image: 2, x: 72, y: 23, scale: 0.76, duration: 148, delay: -84, driftX: 22, driftY: 3, opacity: 0.2 },
  { image: 5, x: 18, y: 61, scale: 0.9, duration: 128, delay: -46, driftX: -28, driftY: -4, opacity: 0.19 },
]
const BIRD_FLOCKS = [
  {
    id: 'north',
    className: 'birdFlockPrimary',
    y: 43,
    duration: 212,
    delay: -52,
    birds: [
      { x: 0, y: 18, scale: 0.72, rotate: -5 },
      { x: 38, y: 5, scale: 0.58, rotate: 3 },
      { x: 72, y: 28, scale: 0.62, rotate: -8 },
      { x: 112, y: 10, scale: 0.48, rotate: 7 },
      { x: 145, y: 36, scale: 0.54, rotate: -2 },
    ],
  },
  {
    id: 'south',
    className: 'birdFlockSecondary',
    y: 18,
    duration: 236,
    delay: -96,
    birds: [
      { x: 0, y: 8, scale: 0.52, rotate: 4 },
      { x: 34, y: 30, scale: 0.64, rotate: -6 },
      { x: 70, y: 14, scale: 0.5, rotate: 9 },
      { x: 110, y: 42, scale: 0.58, rotate: -4 },
      { x: 146, y: 22, scale: 0.46, rotate: 6 },
    ],
  },
  {
    id: 'east',
    className: 'birdFlockTertiary',
    y: 34,
    duration: 198,
    delay: -22,
    birds: [
      { x: 0, y: 26, scale: 0.5, rotate: -9 },
      { x: 32, y: 10, scale: 0.62, rotate: -3 },
      { x: 66, y: 36, scale: 0.54, rotate: 4 },
      { x: 104, y: 18, scale: 0.48, rotate: -7 },
      { x: 140, y: 0, scale: 0.58, rotate: 2 },
    ],
  },
]
const QUALITY_STORAGE_KEY = 'world-map-quality'
const BIRD_SOUND_MIN_DELAY = 10000
const BIRD_SOUND_MAX_DELAY = 15000
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

function WorldMap() {
  const [hitboxes, setHitboxes] = useState({})
  const [activeContinentId, setActiveContinentId] = useState(null)
  const [quality, setQuality] = useState(getInitialQuality)
  const [isQualityOpen, setIsQualityOpen] = useState(false)
  const [enteringContinentId, setEnteringContinentId] = useState(null)
  const windAudioRef = useRef(null)
  const birdAudioRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    async function createHitboxes() {
      const entries = await Promise.all(
        continents.map(async (continent) => [
          continent.id,
          await buildHitboxPath(continent.image),
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
    const audio = windAudioRef.current

    if (!audio) {
      return undefined
    }

    audio.volume = 0.24

    const playWind = () => {
      audio.play().catch(() => {})
    }

    playWind()

    window.addEventListener('pointerdown', playWind, { once: true })
    window.addEventListener('keydown', playWind, { once: true })

    return () => {
      window.removeEventListener('pointerdown', playWind)
      window.removeEventListener('keydown', playWind)
    }
  }, [])

  useEffect(() => {
    const audio = birdAudioRef.current

    if (!audio || quality === 'performance') {
      return undefined
    }

    let timeoutId
    let isCancelled = false

    audio.volume = quality === 'balanced' ? 0.12 : 0.18

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

    scheduleBirdSound()

    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
      audio.pause()
    }
  }, [quality])

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

  const enterContinent = (continentId) => {
    const route = CONTINENT_ROUTES[continentId]

    if (!route || enteringContinentId) {
      return
    }

    setEnteringContinentId(continentId)
    window.dispatchEvent(new CustomEvent(ROUTE_TRANSITION_EVENT, {
      detail: {
        to: route,
        navigationDelay: CONTINENT_NAVIGATION_DELAY,
        openingDuration: CONTINENT_TRANSITION_OPENING_DURATION,
      },
    }))
  }

  const handleContinentKeyDown = (event, continentId) => {
    if (!CONTINENT_ROUTES[continentId] || enteringContinentId) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      enterContinent(continentId)
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.mapFrame}>
        <audio
          ref={windAudioRef}
          className={styles.ambientAudio}
          src={windSound}
          loop
          autoPlay
          preload="auto"
          aria-hidden="true"
        />
        <audio
          ref={birdAudioRef}
          className={styles.ambientAudio}
          src={birdSound}
          preload="auto"
          aria-hidden="true"
        />
        <svg
          className={styles.map}
          viewBox={`0 0 ${mapSize.width} ${mapSize.height}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="Interactive world map"
        >
          <defs>
            <filter
              id="mapWindRipple"
              x="-2%"
              y="-2%"
              width="104%"
              height="104%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.002 0.014"
                numOctaves="1"
                seed="8"
                result="windNoise"
              >
                <animate
                  attributeName="baseFrequency"
                  dur="24s"
                  values="0.002 0.014; 0.003 0.018; 0.0016 0.012; 0.002 0.014"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="windNoise"
                scale="1.15"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>

          <g className={styles.fabricLayer}>
            <image
              className={styles.baseMap}
              href={worldMapImage}
              width={mapSize.width}
              height={mapSize.height}
            />
          </g>

          {continents.map((continent) => (
            <g
              key={continent.id}
              className={styles.continent}
              style={{
                '--continent-glow': continent.glowColor,
                '--continent-glow-fill': continent.glowFill,
                '--continent-glow-opacity': continent.glowOpacity,
                '--continent-glow-strength': continent.glowStrength,
              }}
            >
              {!continent.hideInfo && <title>{continent.name}</title>}
              <g className={styles.fabricLayer}>
                {hitboxes[continent.id] && (
                  <path className={styles.glow} d={hitboxes[continent.id]} />
                )}
                <image
                  className={styles.continentImage}
                  href={continent.image}
                  width={mapSize.width}
                  height={mapSize.height}
                />
              </g>
              {hitboxes[continent.id] && (
                <path
                  className={styles.hitbox}
                  d={hitboxes[continent.id]}
                  data-continent-id={continent.id}
                  role="button"
                  aria-label={continent.name}
                  tabIndex="0"
                  focusable="true"
                  onPointerEnter={() => setActiveContinentId(continent.hideInfo ? null : continent.id)}
                  onPointerLeave={() => setActiveContinentId((current) => (current === continent.id ? null : current))}
                  onMouseEnter={() => setActiveContinentId(continent.hideInfo ? null : continent.id)}
                  onMouseLeave={() => setActiveContinentId((current) => (current === continent.id ? null : current))}
                  onFocus={() => setActiveContinentId(continent.hideInfo ? null : continent.id)}
                  onBlur={() => setActiveContinentId((current) => (current === continent.id ? null : current))}
                  onClick={CONTINENT_ROUTES[continent.id] ? () => enterContinent(continent.id) : undefined}
                  onKeyDown={(event) => handleContinentKeyDown(event, continent.id)}
                />
              )}
            </g>
          ))}

          <foreignObject
            className={styles.atmosphereLayer}
            x="0"
            y="0"
            width={mapSize.width}
            height={mapSize.height}
            aria-hidden="true"
          >
            <div className={styles.atmosphere}>
              {/* All atmosphere layers are CSS-only and ignore pointer events. */}
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
              <div className={styles.cloudShadow} />
              <div className={styles.cloudImageShadows}>
                {CLOUDS.map((cloud, index) => (
                  <img
                    key={`cloud-shadow-${index}`}
                    className={styles.cloudImageShadow}
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
              <div className={styles.colorGrade} />
              <div className={styles.vignette} />
              <div className={styles.snowBandTop}>
                {TOP_SNOW.map((flake) => (
                  <span
                    key={`top-${flake.x}-${flake.delay}`}
                    className={styles.snowflake}
                    style={{
                      '--flake-x': `${flake.x}%`,
                      '--flake-delay': `${flake.delay}s`,
                      '--flake-duration': `${flake.duration}s`,
                      '--flake-drift': `${flake.drift}px`,
                    }}
                  />
                ))}
              </div>
              <div className={styles.snowBandBottom}>
                {BOTTOM_SNOW.map((flake) => (
                  <span
                    key={`bottom-${flake.x}-${flake.delay}`}
                    className={styles.snowflake}
                    style={{
                      '--flake-x': `${flake.x}%`,
                      '--flake-delay': `${flake.delay}s`,
                      '--flake-duration': `${flake.duration}s`,
                      '--flake-drift': `${flake.drift}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          </foreignObject>

          <g className={styles.continentOverlayLayer} aria-hidden="true">
            {continents.filter((continent) => !continent.hideInfo).map((continent) => (
              <foreignObject
                key={`overlay-${continent.id}`}
                data-continent-id={continent.id}
                className={`${styles.continentOverlay} ${
                  activeContinentId === continent.id ? styles.continentOverlayActive : ''
                }`}
                x={continent.overlay.x}
                y={continent.overlay.y}
                width={continent.overlay.width}
                height={continent.overlay.height}
              >
                <div
                  className={styles.continentBadge}
                  style={{
                    '--crest-size': `${continent.overlay.crestSize}px`,
                  }}
                >
                  <img className={styles.continentCrest} src={continent.crest} alt="" />
                  <span className={styles.continentName}>{continent.name}</span>
                </div>
              </foreignObject>
            ))}
          </g>
        </svg>
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
            aria-label="World quality settings"
            aria-expanded={isQualityOpen}
            onClick={() => setIsQualityOpen((current) => !current)}
          >
            <FiSun aria-hidden="true" />
          </button>
          <div className={styles.qualityMenu} aria-label="World quality">
            <span className={styles.qualityTitle}>World Quality</span>
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

export default WorldMap
