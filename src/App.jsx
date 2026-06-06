import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import RegionMap from './pages/RegionMap/RegionMap'
import CityMap from './pages/CityMap/CityMap'

const WorldMap = lazy(() => import('./pages/WorldMap/WorldMap'))
const Eiridor = lazy(() => import('./pages/Eiridor/Eiridor'))

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<WorldMap />} />
          <Route path="/eiridor" element={<Eiridor />} />
          <Route path="/region/:regionId" element={<RegionMap />} />
          <Route path="/city/:cityId" element={<CityMap />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
