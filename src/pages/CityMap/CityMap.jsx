import { useParams } from 'react-router-dom'
import styles from './CityMap.module.scss'

function CityMap() {
  const { cityId } = useParams()

  return (
    <section className={`${styles.page} mapNoSelect`} onDragStart={(event) => event.preventDefault()}>
      <h1>City Map</h1>
      <p>{cityId}</p>
    </section>
  )
}

export default CityMap
