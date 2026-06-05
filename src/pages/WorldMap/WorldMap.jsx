import { useEffect, useRef, useState } from 'react'
import { cloudImages, continents, mapSize, windSound, worldMapImage } from '../../data/continents'
import styles from './WorldMap.module.scss'

const ALPHA_THRESHOLD = 8
const ROW_STEP = 1
const EDGE_PADDING = 0
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
const TOP_SNOW = [
  ...TOP_SNOWFLAKES,
  ...WIND_SNOWFLAKES_TOP,
].slice(0, 15)
const BOTTOM_SNOW = [
  ...BOTTOM_SNOWFLAKES,
  ...WIND_SNOWFLAKES_BOTTOM,
  ...CRYSTAL_SNOWFLAKES_BOTTOM,
].slice(0, 15)
const CLOUDS = [
  { image: 0, x: -9, y: -15, scale: 0.88, duration: 96, delay: -12, driftX: 30, driftY: 2, opacity: 0.39 },
  { image: 3, x: 20, y: -11, scale: 0.76, duration: 124, delay: -54, driftX: -24, driftY: 4, opacity: 0.31 },
  { image: 1, x: 58, y: -15, scale: 0.9, duration: 112, delay: -32, driftX: 27, driftY: -3, opacity: 0.36 },
  { image: 6, x: -12, y: 27, scale: 0.84, duration: 136, delay: -68, driftX: 32, driftY: -6, opacity: 0.34 },
  { image: 4, x: 36, y: 31, scale: 0.78, duration: 108, delay: -28, driftX: -22, driftY: 5, opacity: 0.29 },
  { image: 2, x: 72, y: 23, scale: 0.76, duration: 148, delay: -84, driftX: 22, driftY: 3, opacity: 0.3 },
  { image: 5, x: 18, y: 61, scale: 0.9, duration: 128, delay: -46, driftX: -28, driftY: -4, opacity: 0.29 },
]

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

async function buildHitboxPath(src) {
  const image = await loadImage(src)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })

  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  context.drawImage(image, 0, 0)

  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height)
  const segments = []

  for (let y = 0; y < height; y += ROW_STEP) {
    let x = 0

    while (x < width) {
      const alpha = data[(y * width + x) * 4 + 3]

      if (alpha <= ALPHA_THRESHOLD) {
        x += 1
        continue
      }

      const start = x

      while (x < width && data[(y * width + x) * 4 + 3] > ALPHA_THRESHOLD) {
        x += 1
      }

      const left = Math.max(0, start - EDGE_PADDING)
      const right = Math.min(width, x + EDGE_PADDING)
      const bottom = Math.min(height, y + ROW_STEP)

      segments.push(`M${left} ${y}H${right}V${bottom}H${left}Z`)
    }
  }

  return segments.join('')
}

function WorldMap() {
  const [hitboxes, setHitboxes] = useState({})
  const windAudioRef = useRef(null)

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
        <svg
          className={styles.map}
          viewBox={`0 0 ${mapSize.width} ${mapSize.height}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="Interactive world map"
        >
          <image
            className={styles.baseMap}
            href={worldMapImage}
            width={mapSize.width}
            height={mapSize.height}
          />

          {continents.map((continent) => (
            <g
              key={continent.id}
              className={styles.continent}
              style={{
                '--continent-glow': continent.glowColor,
                '--continent-glow-fill': continent.glowFill,
              }}
            >
              <title>{continent.name}</title>
              {hitboxes[continent.id] && (
                <path className={styles.glow} d={hitboxes[continent.id]} />
              )}
              <image
                className={styles.continentImage}
                href={continent.image}
                width={mapSize.width}
                height={mapSize.height}
              />
              {hitboxes[continent.id] && (
                <path
                  className={styles.hitbox}
                  d={hitboxes[continent.id]}
                  role="button"
                  aria-label={continent.name}
                  tabIndex="0"
                  focusable="true"
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
              <div className={styles.oceanDepth} />
              <div className={styles.oceanCurrent} />
              <div className={styles.waterShimmer} />
              <div className={styles.lightSweeps} />
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
        </svg>
      </div>
    </section>
  )
}

export default WorldMap
