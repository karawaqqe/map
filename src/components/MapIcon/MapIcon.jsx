import { FaMapMarkerAlt } from 'react-icons/fa'
import clsx from 'clsx'
import styles from './MapIcon.module.scss'

function MapIcon({ label = 'Map icon', className }) {
  return (
    <span className={clsx(styles.icon, className)}>
      <FaMapMarkerAlt />
      <span>{label}</span>
    </span>
  )
}

export default MapIcon
