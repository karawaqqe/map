import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'

const WorldMap = lazy(() => import('./pages/WorldMap/WorldMap'))
const Eiridor = lazy(() => import('./pages/Eiridor/Eiridor'))
const HolyLight = lazy(() => import('./pages/HolyLight/HolyLight'))
const RegionMap = lazy(() => import('./pages/RegionMap/RegionMap'))
const CityMap = lazy(() => import('./pages/CityMap/CityMap'))

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<WorldMap />} />
          <Route path="/eiridor" element={<Eiridor />} />
          <Route path="/holy-light" element={<HolyLight />} />
          <Route path="/region/:regionId" element={<RegionMap />} />
          <Route path="/city/:cityId" element={<CityMap />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
