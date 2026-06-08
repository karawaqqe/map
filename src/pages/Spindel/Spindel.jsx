import { useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { ROUTE_TRANSITION_EVENT } from '../../constants/routeTransition'
import styles from './Spindel.module.scss'

const WORLD_NAVIGATION_DELAY = 1150
const WORLD_TRANSITION_OPENING_DURATION = 1100
const spindelMapImage = new URL('../../../img/cubes/Spindel/full_map.png', import.meta.url).href

function Spindel() {
  const [isReturningToWorld, setIsReturningToWorld] = useState(false)

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
        variant: 'black',
      },
    }))
  }

  return (
    <section className={styles.page}>
      <img className={styles.mapImage} src={spindelMapImage} alt="Spindel continent map" draggable="false" />
      <div className={styles.vignette} aria-hidden="true" />
      <button
        className={styles.backButton}
        type="button"
        aria-label="Back to world map"
        disabled={isReturningToWorld}
        onClick={returnToWorld}
      >
        <FiArrowLeft aria-hidden="true" />
      </button>
    </section>
  )
}

export default Spindel
