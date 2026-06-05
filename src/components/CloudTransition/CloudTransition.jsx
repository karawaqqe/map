import { motion } from 'framer-motion'
import styles from './CloudTransition.module.scss'

function CloudTransition() {
  return (
    <motion.div className={styles.transition} aria-hidden="true" />
  )
}

export default CloudTransition
