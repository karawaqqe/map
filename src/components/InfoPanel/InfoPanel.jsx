import clsx from 'clsx'
import styles from './InfoPanel.module.scss'

function InfoPanel({ title, children, className }) {
  return (
    <section className={clsx(styles.panel, className)}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {children}
    </section>
  )
}

export default InfoPanel
