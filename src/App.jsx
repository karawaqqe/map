import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import WorldMap from './pages/WorldMap/WorldMap'
import RegionMap from './pages/RegionMap/RegionMap'
import CityMap from './pages/CityMap/CityMap'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<WorldMap />} />
        <Route path="/region/:regionId" element={<RegionMap />} />
        <Route path="/city/:cityId" element={<CityMap />} />
      </Route>
    </Routes>
  )
}

export default App
