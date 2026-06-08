import { cloudImages } from '../../data/continents'
import styles from './FogTransition.module.scss'

const TRANSITION_CLOUDS = [
  { image: 6, x: -28, y: -18, scale: 1.45, duration: 4600, delay: 0 },
  { image: 2, x: 18, y: -28, scale: 1.34, duration: 5200, delay: 180 },
  { image: 4, x: 54, y: -14, scale: 1.48, duration: 5000, delay: 80 },
  { image: 1, x: -18, y: 28, scale: 1.5, duration: 5600, delay: 240 },
  { image: 5, x: 36, y: 34, scale: 1.56, duration: 5400, delay: 120 },
]

function FogTransition({ mode = 'closing', variant = 'clouds' }) {
  if (variant === 'black') {
    return (
      <div className={`${styles.transition} ${styles.blackTransition} ${styles[mode]}`} aria-hidden="true" />
    )
  }

  return (
    <div className={`${styles.transition} ${styles[mode]}`} aria-hidden="true">
      {/*
      <div className={styles.blurVeil} />
      <div className={styles.fogMass} />
      <div className={styles.fogMassDeep} />
      */}
      <div className={styles.clouds}>
        {TRANSITION_CLOUDS.map((cloud, index) => (
          <img
            key={`${cloud.image}-${index}`}
            className={styles.cloud}
            src={cloudImages[cloud.image]}
            alt=""
            style={{
              '--cloud-x': `${cloud.x}%`,
              '--cloud-y': `${cloud.y}%`,
              '--cloud-scale': cloud.scale,
              '--cloud-duration': `${cloud.duration}ms`,
              '--cloud-delay': `${cloud.delay}ms`,
            }}
          />
        ))}
      </div>
      {/*
      <div className={styles.shadow} />
      <div className={styles.vignette} />
      */}
    </div>
  )
}

export default FogTransition
