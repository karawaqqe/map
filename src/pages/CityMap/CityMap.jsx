import { useParams } from 'react-router-dom'
import styles from './CityMap.module.scss'

function CityMap() {
  const { cityId } = useParams()

  return (
    <section className={styles.page}>
      <h1>City Map</h1>
      <p>{cityId}</p>
    </section>
  )
}

export default CityMap
