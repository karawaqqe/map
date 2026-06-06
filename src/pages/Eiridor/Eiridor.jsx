import { useEffect, useState } from 'react'
import { eiridorMapImage, eiridorMapSize, eiridorRegions } from '../../data/eiridor'
import { buildHitboxPath } from '../../utils/mapHitbox'
import styles from './Eiridor.module.scss'

function Eiridor() {
  const [hitboxes, setHitboxes] = useState({})

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

  return (
    <section className={styles.page}>
      <div className={styles.mapStage}>
        <svg
          className={styles.map}
          viewBox={`0 0 ${eiridorMapSize.width} ${eiridorMapSize.height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Eiridor continent map"
        >
          <defs>
            <filter
              id="eiridorPaperRipple"
              x="-2%"
              y="-2%"
              width="104%"
              height="104%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.003 0.011"
                numOctaves="1"
                seed="14"
                result="paperNoise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="paperNoise"
                scale="0.8"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>

          <g className={styles.paperLayer}>
            <image
              className={styles.baseMap}
              href={eiridorMapImage}
              width={eiridorMapSize.width}
              height={eiridorMapSize.height}
            />
          </g>

          {eiridorRegions.map((region) => (
            <g
              key={region.id}
              className={styles.region}
              style={{
                '--region-glow': region.glowColor,
                '--region-glow-fill': region.glowFill,
                '--region-glow-opacity': region.glowOpacity,
                '--region-glow-strength': region.glowStrength,
              }}
            >
              <title>{region.name}</title>
              <g className={styles.regionLift}>
                {hitboxes[region.id] && (
                  <path className={styles.regionGlow} d={hitboxes[region.id]} />
                )}
                <image
                  className={styles.regionImage}
                  href={region.image}
                  width={eiridorMapSize.width}
                  height={eiridorMapSize.height}
                />
              </g>
              {hitboxes[region.id] && (
                <path
                  className={styles.regionHitbox}
                  d={hitboxes[region.id]}
                  role="button"
                  aria-label={region.name}
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
            width={eiridorMapSize.width}
            height={eiridorMapSize.height}
            aria-hidden="true"
          >
            <div className={styles.atmosphere}>
              <div className={styles.lowMist} />
              <div className={styles.highMist} />
              <div className={styles.emberGrade} />
              <div className={styles.vignette} />
            </div>
          </foreignObject>
        </svg>
      </div>
    </section>
  )
}

export default Eiridor
