import { useParams } from 'react-router-dom'
import styles from './RegionMap.module.scss'

function RegionMap() {
  const { regionId } = useParams()

  return (
    <section className={styles.page}>
      <h1>Region Map</h1>
      <p>{regionId}</p>
    </section>
  )
}

export default RegionMap
