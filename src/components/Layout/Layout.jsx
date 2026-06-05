import { Outlet } from 'react-router-dom'
import styles from './Layout.module.scss'

function Layout() {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
