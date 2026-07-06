import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import AudioConsentGate from './components/AudioConsentGate/AudioConsentGate'

const WorldMap = lazy(() => import('./pages/WorldMap/WorldMap'))
const Eiridor = lazy(() => import('./pages/Eiridor/Eiridor'))
const HolyLight = lazy(() => import('./pages/HolyLight/HolyLight'))
const RegionMap = lazy(() => import('./pages/RegionMap/RegionMap'))
const CityMap = lazy(() => import('./pages/CityMap/CityMap'))
const Shrine = lazy(() => import('./pages/Shrine/Shrine'))
const Spindel = lazy(() => import('./pages/Spindel/Spindel'))
const SpindelBookSection = lazy(() => import('./pages/Spindel/SpindelBookSection'))
const Void = lazy(() => import('./pages/Void/Void'))

function App() {
  return (
    <>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/void" element={<Void />} />
          <Route element={<Layout />}>
            <Route path="/" element={<WorldMap />} />
            <Route path="/eiridor" element={<Eiridor />} />
            <Route path="/holy-light" element={<HolyLight />} />
            <Route path="/shrine" element={<Shrine />} />
            <Route path="/spindel" element={<Spindel />} />
            <Route path="/spindel/room" element={<Spindel />} />
            <Route path="/spindel/edar-voss-journal" element={<SpindelBookSection />} />
            <Route path="/region/:regionId" element={<RegionMap />} />
            <Route path="/holy-light/region/:regionId" element={<RegionMap parentRoute="/holy-light" parentName="Holy Light" />} />
            <Route path="/city/:cityId" element={<CityMap />} />
          </Route>
        </Routes>
      </Suspense>
      <AudioConsentGate />
    </>
  )
}

export default App
