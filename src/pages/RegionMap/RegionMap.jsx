import { useCallback, useEffect, useRef, useState } from 'react'
import { FiArrowLeft, FiMinus, FiPlus, FiSliders } from 'react-icons/fi'
import { useParams } from 'react-router-dom'
import { ROUTE_TRANSITION_EVENT } from '../../constants/routeTransition'
import styles from './RegionMap.module.scss'
import drakenholmMapImage from '../../../img/continents/Regions/Eiridor/Drakenholm/Untitled23_20260607205818.png'
import everdanMapImage from '../../../img/continents/Regions/Holylight/Everdawn/Everdan.png'
import kaelmoreMapImage from '../../../img/continents/Regions/Holylight/Kaelmore/kaelmore.png'
import birdImage from '../../../img/bird/newbird.png'
import birdSound from '../../../sounds/birds/birdsound.mp3'
import cloud1 from '../../../img/clouds/cloud1.png'
import cloud2 from '../../../img/clouds/cloud2.png'
import cloud3 from '../../../img/clouds/cloud3.png'
import cloud4 from '../../../img/clouds/cloud4.png'
import cloud5 from '../../../img/clouds/cloud5.png'
import cloud6 from '../../../img/clouds/cloud6.png'
import cloud7 from '../../../img/clouds/cloud7.png'
import churchIcon from '../../../svg/Eiridor/Church/cross3.svg'
import tavernIcon from '../../../svg/Eiridor/Bar/drakenholm_tavern_icon.svg'
import forgeIcon from '../../../svg/Eiridor/Forge/forge_transparent.svg'
import marketIcon from '../../../svg/Eiridor/Market/market_scalesdrakenholm.svg'
import lyumerisTavernIcon from '../../../svg/Eiridor/Bar/lumeris_tavern_icon_transparent.svg'
import everdanChurchIcon from '../../../svg/HolyLight/Church/cross11.svg'
import everdanForgeIcon from '../../../svg/HolyLight/Forge/everdane_forge_icon.svg'
import everdanMarketIcon from '../../../svg/HolyLight/Market/everdane_market_scales_detailed.svg'
import everdanMonasteryIcon from '../../../svg/HolyLight/Monastery/golden_monastery_cross.svg'
import everdanTavernIcon from '../../../svg/HolyLight/Bar/everdan_tavern_icon.svg'
import lyumerisChurchIcon from '../../../svg/infopanel/cross2.svg'
import lyumerisForgeIcon from '../../../svg/infopanel/forge_icon.svg'
import lyumerisMarketIcon from '../../../svg/infopanel/market_scales.svg'
import kaelmoreChurchIcon from '../../../svg/HolyLight/Church/cross8.svg'
import kaelmoreForgeIcon from '../../../svg/HolyLight/Forge/kaelmore_forge_icon.svg'
import kaelmoreMarketIcon from '../../../svg/HolyLight/Market/kaelmore_market_icon_no_bg.svg'
import kaelmoreMonasteryIcon from '../../../svg/HolyLight/Monastery/dark_monastery_shield.svg'
import kaelmoreTavernIcon from '../../../svg/HolyLight/Bar/kaelmor_tavern_icon.svg'

const lyumerisTileImages = Object.entries(import.meta.glob(
  '../../../img/continents/Regions/Eiridor/lumeris/tiles/*.png',
  { eager: true, import: 'default' },
))
  .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
  .map(([, image]) => image)

const MIN_ZOOM = 1
const MAX_VISIBLE_AREA_PERCENT = 20
const MAX_ZOOM = 100 / MAX_VISIBLE_AREA_PERCENT
const INITIAL_ZOOM = MAX_ZOOM
const INITIAL_FOCUS = { x: 0.49, y: 0.47 }
const ZOOM_STEP = 0.35
const EIRIDOR_NAVIGATION_DELAY = 1150
const EIRIDOR_TRANSITION_OPENING_DURATION = 1100
const BIRD_SOUND_MIN_DELAY = 7000
const BIRD_SOUND_MAX_DELAY = 19000
const QUALITY_STORAGE_KEY = 'region-map-quality'
const QUALITY_MODES = [
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'performance', label: 'Performance' },
]
const QUALITY_BODY_CLASSES = QUALITY_MODES.map((mode) => `quality-${mode.id}`)
const DRAKENHOLM_MARKERS = [
  { id: 'marker-01', type: 'tavern', x: 10.9527, y: 11.9960 },
  { id: 'marker-02', type: 'tavern', x: 54.4894, y: 14.1379 },
  { id: 'marker-03', type: 'tavern', x: 21.8572, y: 18.9043 },
  { id: 'marker-04', type: 'tavern', x: 89.5741, y: 19.4590 },
  { id: 'marker-05', type: 'church', x: 20.0306, y: 19.7089 },
  { id: 'marker-06', type: 'tavern', x: 41.9741, y: 19.9367 },
  { id: 'marker-07', type: 'tavern', x: 65.3796, y: 26.4884 },
  { id: 'marker-08', type: 'tavern', x: 61.9278, y: 32.4340 },
  { id: 'marker-09', type: 'church', x: 42.1230, y: 33.8962 },
  { id: 'marker-10', type: 'tavern', x: 40.7727, y: 35.7863 },
  { id: 'marker-11', type: 'tavern', x: 50.1007, y: 39.8224 },
  { id: 'marker-12', type: 'tavern', x: 46.7117, y: 41.6331 },
  { id: 'marker-13', type: 'church', x: 66.2416, y: 41.6331 },
  { id: 'marker-14', type: 'tavern', x: 54.0396, y: 43.2712 },
  { id: 'marker-15', type: 'tavern', x: 23.3941, y: 43.3474 },
  { id: 'marker-16', type: 'church', x: 49.6007, y: 43.3993 },
  { id: 'marker-17', type: 'tavern', x: 39.0348, y: 44.1310 },
  { id: 'marker-18', type: 'tavern', x: 86.5841, y: 46.4718 },
  { id: 'marker-19', type: 'tavern', x: 51.7646, y: 46.4751 },
  { id: 'marker-20', type: 'tavern', x: 45.9742, y: 47.3827 },
  { id: 'marker-21', type: 'tavern', x: 79.8200, y: 48.0343 },
  { id: 'marker-22', type: 'tavern', x: 12.8294, y: 50.3549 },
  { id: 'marker-23', type: 'tavern', x: 47.7762, y: 50.7847 },
  { id: 'marker-24', type: 'tavern', x: 51.5766, y: 52.6222 },
  { id: 'marker-25', type: 'church', x: 61.4785, y: 56.4024 },
  { id: 'marker-26', type: 'church', x: 35.7096, y: 56.7313 },
  { id: 'marker-27', type: 'tavern', x: 93.4737, y: 57.0562 },
  { id: 'marker-28', type: 'tavern', x: 54.1260, y: 58.9466 },
  { id: 'marker-29', type: 'tavern', x: 70.6562, y: 61.6955 },
  { id: 'marker-30', type: 'tavern', x: 58.4164, y: 66.5578 },
  { id: 'marker-31', type: 'church', x: 37.2343, y: 68.7500 },
  { id: 'marker-32', type: 'tavern', x: 38.9984, y: 69.6081 },
  { id: 'marker-33', type: 'tavern', x: 52.1255, y: 70.1865 },
  { id: 'marker-34', type: 'tavern', x: 89.0846, y: 71.8495 },
  { id: 'marker-35', type: 'tavern', x: 11.7540, y: 74.0686 },
  { id: 'marker-36', type: 'church', x: 64.7918, y: 74.9772 },
  { id: 'marker-37', type: 'tavern', x: 67.6165, y: 75.7837 },
  { id: 'marker-38', type: 'church', x: 12.0916, y: 76.6149 },
  { id: 'marker-39', type: 'tavern', x: 78.8840, y: 79.3130 },
  { id: 'marker-40', type: 'tavern', x: 33.4209, y: 80.7712 },
  { id: 'marker-41', type: 'tavern', x: 50.3632, y: 84.8298 },
  { id: 'marker-42', type: 'tavern', x: 17.7169, y: 88.8357 },
  { id: 'marker-43', type: 'forge', x: 44.8260, y: 18.7261 },
  { id: 'marker-44', type: 'forge', x: 93.3887, y: 21.3277 },
  { id: 'marker-45', type: 'market', x: 21.3510, y: 23.1261 },
  { id: 'marker-46', type: 'market', x: 54.8142, y: 28.9785 },
  { id: 'marker-47', type: 'market', x: 45.4021, y: 43.7533 },
  { id: 'marker-48', type: 'forge', x: 20.4133, y: 45.7765 },
  { id: 'marker-49', type: 'forge', x: 49.6512, y: 54.4243 },
  { id: 'marker-50', type: 'forge', x: 47.3137, y: 72.1513 },
  { id: 'marker-51', type: 'forge', x: 11.7768, y: 72.8254, offsetX: 3.75, offsetY: 2.5 },
]

const EVERDAN_MARKERS = [
  { id: 'everdan-tavern-01', type: 'tavern', x: 46.9383, y: 11.2865 },
  { id: 'everdan-monastery-01', type: 'monastery', x: 80.8004, y: 14.1196 },
  { id: 'everdan-church-01', type: 'church', x: 71.4449, y: 49.6366 },
  { id: 'everdan-market-01', type: 'market', x: 69.5654, y: 55.1489 },
  { id: 'everdan-forge-01', type: 'forge', x: 74.2297, y: 54.8820 },
]

const KAELMORE_MARKERS = [
  { id: 'kaelmore-market-01', type: 'market', x: 69.3889, y: 20.2484 },
  { id: 'kaelmore-market-02', type: 'market', x: 74.0042, y: 49.5873 },
  { id: 'kaelmore-market-03', type: 'market', x: 39.6330, y: 54.0496 },
  { id: 'kaelmore-church-01', type: 'church', x: 12.2440, y: 45.4210 },
  { id: 'kaelmore-church-02', type: 'church', x: 54.7865, y: 61.7665 },
  { id: 'kaelmore-tavern-01', type: 'tavern', x: 67.8542, y: 5.7063 },
  { id: 'kaelmore-tavern-02', type: 'tavern', x: 57.3009, y: 14.7126 },
  { id: 'kaelmore-tavern-03', type: 'tavern', x: 36.7824, y: 23.5133 },
  { id: 'kaelmore-tavern-04', type: 'tavern', x: 50.3398, y: 30.7476 },
  { id: 'kaelmore-tavern-05', type: 'tavern', x: 58.3293, y: 31.8691 },
  { id: 'kaelmore-tavern-06', type: 'tavern', x: 40.7501, y: 33.7235 },
  { id: 'kaelmore-tavern-07', type: 'tavern', x: 28.6943, y: 34.0479 },
  { id: 'kaelmore-tavern-08', type: 'tavern', x: 63.2728, y: 35.0263 },
  { id: 'kaelmore-tavern-09', type: 'tavern', x: 47.2961, y: 41.8106 },
  { id: 'kaelmore-tavern-10', type: 'tavern', x: 76.1272, y: 42.5649 },
  { id: 'kaelmore-tavern-11', type: 'tavern', x: 71.0992, y: 44.0726 },
  { id: 'kaelmore-tavern-12', type: 'tavern', x: 79.2213, y: 44.9930 },
  { id: 'kaelmore-tavern-13', type: 'tavern', x: 56.2157, y: 45.4787 },
  { id: 'kaelmore-tavern-14', type: 'tavern', x: 38.6796, y: 47.1099 },
  { id: 'kaelmore-tavern-15', type: 'tavern', x: 94.2363, y: 48.1683 },
  { id: 'kaelmore-tavern-16', type: 'tavern', x: 78.4093, y: 50.3689 },
  { id: 'kaelmore-tavern-17', type: 'tavern', x: 67.5043, y: 55.5455 },
  { id: 'kaelmore-tavern-18', type: 'tavern', x: 22.8969, y: 58.0519 },
  { id: 'kaelmore-tavern-19', type: 'tavern', x: 31.3676, y: 60.4562 },
  { id: 'kaelmore-tavern-20', type: 'tavern', x: 45.0586, y: 61.3128 },
  { id: 'kaelmore-tavern-21', type: 'tavern', x: 86.7933, y: 64.5078 },
  { id: 'kaelmore-tavern-22', type: 'tavern', x: 52.3677, y: 68.5438 },
  { id: 'kaelmore-tavern-23', type: 'tavern', x: 36.9029, y: 68.9711 },
  { id: 'kaelmore-tavern-24', type: 'tavern', x: 64.3701, y: 70.3384 },
  { id: 'kaelmore-tavern-25', type: 'tavern', x: 60.1620, y: 76.2689 },
  { id: 'kaelmore-tavern-26', type: 'tavern', x: 36.9042, y: 76.8974 },
  { id: 'kaelmore-tavern-27', type: 'tavern', x: 40.5854, y: 80.9921 },
  { id: 'kaelmore-tavern-28', type: 'tavern', x: 27.3807, y: 81.6447 },
  { id: 'kaelmore-tavern-29', type: 'tavern', x: 48.0166, y: 83.5591 },
  { id: 'kaelmore-forge-01', type: 'forge', x: 23.6419, y: 33.0923 },
  { id: 'kaelmore-forge-02', type: 'forge', x: 85.7625, y: 47.8299 },
  { id: 'kaelmore-forge-03', type: 'forge', x: 72.0204, y: 48.3951 },
  { id: 'kaelmore-monastery-01', type: 'monastery', x: 75.2077, y: 44.8671 },
  { id: 'kaelmore-monastery-02', type: 'monastery', x: 12.4729, y: 54.6873 },
]

const LYUMERIS_MARKERS = [
  { id: 'lyumeris-tavern-01', type: 'tavern', x: 49.9526, y: 8.4895 },
  { id: 'lyumeris-tavern-02', type: 'tavern', x: 22.2391, y: 12.6516 },
  { id: 'lyumeris-tavern-03', type: 'tavern', x: 35.3476, y: 16.1797 },
  { id: 'lyumeris-tavern-04', type: 'tavern', x: 29.7973, y: 19.6527 },
  { id: 'lyumeris-tavern-05', type: 'tavern', x: 36.3989, y: 28.2387 },
  { id: 'lyumeris-tavern-06', type: 'tavern', x: 26.3118, y: 29.4101 },
  { id: 'lyumeris-tavern-07', type: 'tavern', x: 47.2912, y: 32.0149 },
  { id: 'lyumeris-tavern-08', type: 'tavern', x: 74.5785, y: 35.5292 },
  { id: 'lyumeris-tavern-09', type: 'tavern', x: 56.5732, y: 39.6775 },
  { id: 'lyumeris-tavern-10', type: 'tavern', x: 46.2303, y: 40.3390 },
  { id: 'lyumeris-tavern-11', type: 'tavern', x: 70.8846, y: 43.7155 },
  { id: 'lyumeris-tavern-12', type: 'tavern', x: 12.1502, y: 44.8563 },
  { id: 'lyumeris-tavern-13', type: 'tavern', x: 33.8132, y: 53.8589 },
  { id: 'lyumeris-tavern-14', type: 'tavern', x: 64.3872, y: 61.6455 },
  { id: 'lyumeris-forge-01', type: 'forge', x: 52.6331, y: 7.4283 },
  { id: 'lyumeris-forge-02', type: 'forge', x: 36.3137, y: 23.6218 },
  { id: 'lyumeris-forge-03', type: 'forge', x: 9.6514, y: 42.8749 },
  { id: 'lyumeris-market-01', type: 'market', x: 51.4220, y: 36.0410 },
  { id: 'lyumeris-church-01', type: 'church', x: 37.7827, y: 26.1859 },
  { id: 'lyumeris-church-02', type: 'church', x: 48.6460, y: 41.0426 },
  { id: 'lyumeris-church-03', type: 'church', x: 66.3297, y: 53.2256 },
]

const MARKER_ICONS = {
  church: churchIcon,
  forge: forgeIcon,
  market: marketIcon,
  tavern: tavernIcon,
}
const EVERDAN_MARKER_ICONS = {
  church: everdanChurchIcon,
  forge: everdanForgeIcon,
  market: everdanMarketIcon,
  monastery: everdanMonasteryIcon,
  tavern: everdanTavernIcon,
}
const KAELMORE_MARKER_ICONS = {
  church: kaelmoreChurchIcon,
  forge: kaelmoreForgeIcon,
  market: kaelmoreMarketIcon,
  monastery: kaelmoreMonasteryIcon,
  tavern: kaelmoreTavernIcon,
}
const LYUMERIS_MARKER_ICONS = {
  church: lyumerisChurchIcon,
  forge: lyumerisForgeIcon,
  market: lyumerisMarketIcon,
  tavern: lyumerisTavernIcon,
}
const MARKER_LABELS = {
  church: 'Church',
  forge: 'Forge',
  market: 'Market',
  monastery: 'Monastery',
  tavern: 'Tavern',
}
const DEBUG_REGION_TILES = false

// Region tile coordinates are controlled here. Use map pixel coordinates:
// { image, x, y, width, height }. Future 1333x666 tiles can be added in this array.
const createFullRegionTile = (image, width, height) => [
  { id: 'base-0', image, x: 0, y: 0, width, height },
]

const createOverlappedRegionTiles = (images, width, height, columns, rows, overlap) => {
  const tiles = []

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const baseX = Math.floor((column * width) / columns)
      const baseY = Math.floor((row * height) / rows)
      const baseRight = Math.floor(((column + 1) * width) / columns)
      const baseBottom = Math.floor(((row + 1) * height) / rows)
      const x = Math.max(0, baseX - overlap)
      const y = Math.max(0, baseY - overlap)
      const right = Math.min(width, baseRight + overlap)
      const bottom = Math.min(height, baseBottom + overlap)

      tiles.push({
        id: `tile-${row}-${column}`,
        image: images[row * columns + column],
        x,
        y,
        width: right - x,
        height: bottom - y,
      })
    }
  }

  return tiles
}

const cloudImages = [cloud1, cloud2, cloud3, cloud4, cloud5, cloud6, cloud7]
const CINEMATIC_CLOUDS = [
  { image: 0, x: 6, y: 9, scale: 0.84, duration: 132, delay: -24, driftX: 18, driftY: 2, opacity: 0.44 },
  { image: 3, x: 28, y: 21, scale: 0.76, duration: 156, delay: -70, driftX: -14, driftY: -3, opacity: 0.38 },
  { image: 5, x: 48, y: 7, scale: 0.88, duration: 148, delay: -48, driftX: 16, driftY: 4, opacity: 0.34 },
  { image: 2, x: 67, y: 34, scale: 0.72, duration: 170, delay: -108, driftX: -12, driftY: 3, opacity: 0.32 },
  { image: 6, x: 82, y: 16, scale: 0.78, duration: 142, delay: -92, driftX: 13, driftY: -2, opacity: 0.34 },
]
const BALANCED_CLOUDS = [
  { image: 0, x: 10, y: 12, scale: 0.72, duration: 76, delay: -34, driftX: 18, driftY: 3, opacity: 0.2 },
  { image: 3, x: 42, y: 8, scale: 0.66, duration: 86, delay: -60, driftX: -16, driftY: 4, opacity: 0.18 },
  { image: 6, x: 70, y: 32, scale: 0.64, duration: 82, delay: -48, driftX: 14, driftY: -3, opacity: 0.16 },
]
const LYUMERIS_CINEMATIC_CLOUDS = [
  { image: 0, x: 6, y: 8, scale: 0.9, duration: 150, delay: -30, driftX: 12, driftY: 2, opacity: 0.2 },
  { image: 3, x: 28, y: 20, scale: 0.78, duration: 172, delay: -84, driftX: -10, driftY: 3, opacity: 0.16 },
  { image: 5, x: 58, y: 11, scale: 0.82, duration: 160, delay: -52, driftX: 11, driftY: -2, opacity: 0.15 },
  { image: 6, x: 78, y: 34, scale: 0.7, duration: 184, delay: -112, driftX: -8, driftY: 2, opacity: 0.13 },
]
const LYUMERIS_BALANCED_CLOUDS = [
  { image: 0, x: 12, y: 13, scale: 0.74, duration: 104, delay: -28, driftX: 9, driftY: 1, opacity: 0.07 },
  { image: 6, x: 66, y: 29, scale: 0.64, duration: 118, delay: -64, driftX: -8, driftY: 2, opacity: 0.06 },
]
const CINEMATIC_BIRD_FLOCKS = [
  {
    id: 'north-wall',
    y: 24,
    duration: 162,
    delay: -28,
    birds: [
      { x: 0, y: 11, scale: 0.38, rotate: -5 },
      { x: 28, y: 2, scale: 0.32, rotate: 3 },
      { x: 55, y: 18, scale: 0.34, rotate: -7 },
      { x: 88, y: 7, scale: 0.28, rotate: 6 },
    ],
  },
  {
    id: 'southern-road',
    y: 58,
    duration: 188,
    delay: -86,
    birds: [
      { x: 0, y: 8, scale: 0.3, rotate: 4 },
      { x: 24, y: 23, scale: 0.35, rotate: -6 },
      { x: 54, y: 12, scale: 0.28, rotate: 8 },
      { x: 82, y: 28, scale: 0.3, rotate: -4 },
    ],
  },
]
const QUALITY_ATMOSPHERE = {
  cinematic: {
    clouds: CINEMATIC_CLOUDS,
    fogClassName: '',
    showBirds: true,
  },
  balanced: {
    clouds: BALANCED_CLOUDS,
    fogClassName: 'fogLayerBalanced',
    showBirds: false,
  },
  performance: {
    clouds: [],
    fogClassName: 'fogLayerPerformance',
    showBirds: false,
  },
}
const REGION_MAPS = {
  drakenholm: {
    aspectRatio: '2 / 1',
    focus: INITIAL_FOCUS,
    height: 2000,
    markers: DRAKENHOLM_MARKERS,
    name: 'Drakenholm',
    tiles: createFullRegionTile(drakenholmMapImage, 4000, 2000),
    width: 4000,
  },
  everdan: {
    aspectRatio: '4500 / 2500',
    birdFlocks: [],
    focus: { x: 0.5, y: 0.5 },
    height: 2500,
    markerIcons: EVERDAN_MARKER_ICONS,
    markers: EVERDAN_MARKERS,
    name: 'Everdan',
    tiles: createFullRegionTile(everdanMapImage, 4500, 2500),
    width: 4500,
  },
  everdawn: {
    aspectRatio: '4500 / 2500',
    birdFlocks: [],
    focus: { x: 0.5, y: 0.5 },
    height: 2500,
    markerIcons: EVERDAN_MARKER_ICONS,
    markers: EVERDAN_MARKERS,
    name: 'Everdan',
    tiles: createFullRegionTile(everdanMapImage, 4500, 2500),
    width: 4500,
  },
  kaelmore: {
    aspectRatio: '4566 / 2403',
    focus: { x: 0.5, y: 0.48 },
    height: 2403,
    markerIcons: KAELMORE_MARKER_ICONS,
    markers: KAELMORE_MARKERS,
    name: 'Kaelmore',
    tiles: createFullRegionTile(kaelmoreMapImage, 4566, 2403),
    width: 4566,
  },
  lyumeris: {
    aspectRatio: '5279 / 3628',
    birdFlocks: [],
    focus: { x: 0.5, y: 0.5 },
    height: 3628,
    markerIcons: LYUMERIS_MARKER_ICONS,
    markers: LYUMERIS_MARKERS,
    name: 'Lyumeris',
    qualityAtmosphere: {
      cinematic: {
        clouds: LYUMERIS_CINEMATIC_CLOUDS,
        fogClassName: 'lumerisFogLayer',
        showBirds: false,
      },
      balanced: {
        clouds: LYUMERIS_BALANCED_CLOUDS,
        fogClassName: 'lumerisFogLayerBalanced',
        showBirds: false,
      },
      performance: {
        clouds: [],
        fogClassName: 'lumerisFogLayerPerformance',
        showBirds: false,
      },
    },
    surfaceBackground: 'radial-gradient(ellipse at 48% 42%, rgba(244, 236, 216, 0.82), transparent 58%), linear-gradient(135deg, #eee7d8 0%, #ded0b6 48%, #f7f3ea 100%)',
    tiles: createOverlappedRegionTiles(lyumerisTileImages, 5279, 3628, 4, 4, 16),
    width: 5279,
  },
}

function getInitialQuality() {
  if (typeof window === 'undefined') {
    return 'cinematic'
  }

  let storedQuality = null

  try {
    storedQuality = window.localStorage.getItem(QUALITY_STORAGE_KEY)
  } catch {
    storedQuality = null
  }

  return QUALITY_MODES.some((mode) => mode.id === storedQuality) ? storedQuality : 'cinematic'
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getPanLimit(stage, surface, zoom) {
  if (!stage || !surface) {
    return { x: 0, y: 0 }
  }

  return {
    x: Math.max(0, (surface.clientWidth * zoom - stage.clientWidth) / 2),
    y: Math.max(0, (surface.clientHeight * zoom - stage.clientHeight) / 2),
  }
}

function clampPan(pan, zoom, stage, surface) {
  const limit = getPanLimit(stage, surface, zoom)

  return {
    x: clamp(pan.x, -limit.x, limit.x),
    y: clamp(pan.y, -limit.y, limit.y),
  }
}

function getFocusedPan(stage, surface, zoom, focus = INITIAL_FOCUS) {
  if (!stage || !surface) {
    return { x: 0, y: 0 }
  }

  return clampPan({
    x: -(focus.x - 0.5) * surface.clientWidth * zoom,
    y: -(focus.y - 0.5) * surface.clientHeight * zoom,
  }, zoom, stage, surface)
}

function getTileStyle(tile, region) {
  return {
    '--tile-left': `${(tile.x / region.width) * 100}%`,
    '--tile-top': `${(tile.y / region.height) * 100}%`,
    '--tile-width': `${(tile.width / region.width) * 100}%`,
    '--tile-height': `${(tile.height / region.height) * 100}%`,
  }
}

function RegionMap({ parentName = 'Eiridor', parentRoute = '/eiridor' }) {
  const { regionId } = useParams()
  const stageRef = useRef(null)
  const mapSurfaceRef = useRef(null)
  const dragRef = useRef(null)
  const birdAudioRef = useRef(null)
  const hasInitialCameraRef = useRef(false)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 })
  const [quality, setQuality] = useState(getInitialQuality)
  const [isQualityOpen, setIsQualityOpen] = useState(false)
  const [isReturningToParent, setIsReturningToParent] = useState(false)
  const [loadedTiles, setLoadedTiles] = useState({ regionId: null, tiles: {} })
  const region = REGION_MAPS[regionId]

  const setStageElement = useCallback((node) => {
    stageRef.current = node
  }, [])

  const setMapSurfaceElement = useCallback((node) => {
    mapSurfaceRef.current = node
  }, [])

  useEffect(() => {
    hasInitialCameraRef.current = false
  }, [regionId])

  useEffect(() => {
    const syncCameraBounds = () => {
      const stage = stageRef.current
      const surface = mapSurfaceRef.current

      if (!stage || !surface) {
        return
      }

      setMapSize((currentSize) => {
        const nextSize = {
          width: surface.clientWidth,
          height: surface.clientHeight,
        }

        return currentSize.width === nextSize.width && currentSize.height === nextSize.height
          ? currentSize
          : nextSize
      })

      setPan((currentPan) => {
        if (!hasInitialCameraRef.current) {
          hasInitialCameraRef.current = true
          return getFocusedPan(stage, surface, INITIAL_ZOOM, region?.focus)
        }

        return clampPan(currentPan, zoom, stage, surface)
      })
    }

    syncCameraBounds()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', syncCameraBounds)

      return () => {
        window.removeEventListener('resize', syncCameraBounds)
      }
    }

    const observer = new ResizeObserver(syncCameraBounds)
    const stage = stageRef.current
    const surface = mapSurfaceRef.current

    if (stage) {
      observer.observe(stage)
    }

    if (surface) {
      observer.observe(surface)
    }

    return () => {
      observer.disconnect()
    }
  }, [region, zoom])

  useEffect(() => {
    document.body.classList.remove(...QUALITY_BODY_CLASSES)
    document.body.classList.add(`quality-${quality}`)

    try {
      window.localStorage.setItem(QUALITY_STORAGE_KEY, quality)
    } catch {
      // Quality still applies for this session if storage is unavailable.
    }

    return () => {
      document.body.classList.remove(...QUALITY_BODY_CLASSES)
    }
  }, [quality])

  useEffect(() => {
    const audio = birdAudioRef.current

    if (!audio || quality !== 'cinematic') {
      return undefined
    }

    let timeoutId
    let isCancelled = false

    audio.volume = 0.14

    const getNextDelay = () => (
      BIRD_SOUND_MIN_DELAY + Math.random() * (BIRD_SOUND_MAX_DELAY - BIRD_SOUND_MIN_DELAY)
    )

    const scheduleBirdSound = () => {
      timeoutId = window.setTimeout(() => {
        if (isCancelled) {
          return
        }

        audio.currentTime = 0
        audio.play().catch(() => {})
        scheduleBirdSound()
      }, getNextDelay())
    }

    const startBirdSound = () => {
      window.clearTimeout(timeoutId)
      audio.currentTime = 0
      audio.play().catch(() => {})
      scheduleBirdSound()
    }

    window.addEventListener('pointerdown', startBirdSound, { once: true })
    window.addEventListener('keydown', startBirdSound, { once: true })
    scheduleBirdSound()

    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
      window.removeEventListener('pointerdown', startBirdSound)
      window.removeEventListener('keydown', startBirdSound)
      audio.pause()
    }
  }, [quality])

  const updateZoom = (nextZoom) => {
    setZoom((currentZoom) => {
      const resolvedZoom = clamp(
        typeof nextZoom === 'function' ? nextZoom(currentZoom) : nextZoom,
        MIN_ZOOM,
        MAX_ZOOM,
      )

      setPan((currentPan) => (
        clampPan(currentPan, resolvedZoom, stageRef.current, mapSurfaceRef.current)
      ))

      return resolvedZoom
    })
  }

  const handlePointerDown = (event) => {
    if (!region) {
      return
    }

    const limit = getPanLimit(stageRef.current, mapSurfaceRef.current, zoom)

    if (!limit.x && !limit.y) {
      return
    }

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      pan,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!dragRef.current) {
      return
    }

    const nextPan = {
      x: dragRef.current.pan.x + event.clientX - dragRef.current.startX,
      y: dragRef.current.pan.y + event.clientY - dragRef.current.startY,
    }

    setPan(clampPan(nextPan, zoom, stageRef.current, mapSurfaceRef.current))
  }

  const handlePointerUp = () => {
    dragRef.current = null
  }

  const returnToParent = () => {
    if (isReturningToParent) {
      return
    }

    setIsReturningToParent(true)
    window.dispatchEvent(new CustomEvent(ROUTE_TRANSITION_EVENT, {
      detail: {
        to: parentRoute,
        navigationDelay: EIRIDOR_NAVIGATION_DELAY,
        openingDuration: EIRIDOR_TRANSITION_OPENING_DURATION,
      },
    }))
  }

  const closeQualityPanelOnBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsQualityOpen(false)
    }
  }

  if (!region) {
    return (
      <section className={styles.page}>
        <button
          className={styles.backButton}
          type="button"
          aria-label={`Back to ${parentName}`}
          disabled={isReturningToParent}
          onClick={returnToParent}
        >
          <FiArrowLeft aria-hidden="true" />
        </button>
        <h1>Region Map</h1>
        <p>{regionId}</p>
      </section>
    )
  }

  const atmosphere = region.qualityAtmosphere?.[quality] ??
    QUALITY_ATMOSPHERE[quality] ??
    QUALITY_ATMOSPHERE.cinematic
  const birdFlocks = region.birdFlocks ?? CINEMATIC_BIRD_FLOCKS
  const hasRegionBirdFlocks = region.birdFlocks !== undefined
  const showMapAtmosphere = atmosphere.clouds.length > 0 || atmosphere.fogClassName !== null
  const showBirdFlocks = atmosphere.showBirds && birdFlocks.length > 0
  const renderBirdFlocks = (className = styles.birdLayer, isMapBound = false) => (
    <div className={className} aria-hidden="true">
      {birdFlocks.map((flock) => (
        <div
          key={flock.id}
          className={styles.birdFlock}
          style={{
            '--flock-x': `${flock.x ?? -10}%`,
            '--flock-y': `${flock.y}%`,
            '--flock-travel-x': isMapBound
              ? `${((flock.travelX ?? 0) * mapSize.width) / 100}px`
              : `${flock.travelX ?? 120}vw`,
            '--flock-travel-y': isMapBound
              ? `${((flock.travelY ?? 0) * mapSize.height) / 100}px`
              : `${flock.travelY ?? 4}vh`,
            '--flock-duration': `${flock.duration}s`,
            '--flock-delay': `${flock.delay}s`,
          }}
        >
          {flock.birds.map((bird, index) => (
            <img
              key={`${flock.id}-${index}`}
              className={styles.bird}
              src={birdImage}
              alt=""
              style={{
                '--bird-x': `${bird.x}px`,
                '--bird-y': `${bird.y}px`,
                '--bird-scale': isMapBound ? (bird.scale * INITIAL_ZOOM) / zoom : bird.scale,
                '--bird-rotate': `${bird.rotate}deg`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <section className={styles.page}>
      <div
        ref={setStageElement}
        className={styles.mapStage}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className={styles.mapLayer}>
          <div
            ref={setMapSurfaceElement}
            className={styles.mapSurface}
            style={{
              '--region-aspect-ratio': region.aspectRatio ?? '2 / 1',
              '--region-surface-background': region.surfaceBackground,
              left: `calc(50% + ${pan.x}px)`,
              top: `calc(50% + ${pan.y}px)`,
              transform: `translate(-50%, -50%) scale(${zoom})`,
            }}
          >
            <div
              className={`${styles.mapTiles} ${DEBUG_REGION_TILES ? styles.mapTilesDebug : ''}`}
              aria-label={`${region.name} region map`}
              role="img"
            >
              {region.tiles.map((tile) => (
                <div
                  key={tile.id}
                  className={styles.mapTile}
                  style={getTileStyle(tile, region)}
                >
                  <img
                    className={`${styles.regionMap} ${
                      loadedTiles.regionId === regionId && loadedTiles.tiles[tile.id]
                        ? styles.regionMapLoaded
                        : ''
                    }`}
                    src={tile.image}
                    alt=""
                    draggable="false"
                    fetchPriority="high"
                    decoding="async"
                    onLoad={() => {
                      setLoadedTiles((currentLoadedTiles) => ({
                        regionId,
                        tiles: {
                          ...(currentLoadedTiles.regionId === regionId
                            ? currentLoadedTiles.tiles
                            : {}),
                          [tile.id]: true,
                        },
                      }))
                    }}
                  />
                </div>
              ))}
            </div>
            {showMapAtmosphere && (
              <div className={styles.mapAtmosphere} aria-hidden="true">
                <div
                  className={`${styles.fogLayer} ${
                    atmosphere.fogClassName ? styles[atmosphere.fogClassName] : ''
                  }`}
                />
                {atmosphere.clouds.length > 0 && (
                  <div className={styles.cloudImages}>
                    {atmosphere.clouds.map((cloud, index) => (
                      <img
                        key={`cloud-${index}`}
                        className={styles.cloudImage}
                        src={cloudImages[cloud.image]}
                        alt=""
                        style={{
                          '--cloud-x': `${cloud.x}%`,
                          '--cloud-y': `${cloud.y}%`,
                          '--cloud-scale': cloud.scale,
                          '--cloud-duration': `${cloud.duration}s`,
                          '--cloud-delay': `${cloud.delay}s`,
                          '--cloud-drift-x': `${cloud.driftX}%`,
                          '--cloud-drift-y': `${cloud.driftY}%`,
                          '--cloud-opacity': cloud.opacity,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            {showBirdFlocks &&
              hasRegionBirdFlocks &&
              renderBirdFlocks(`${styles.birdLayer} ${styles.mapBirdLayer}`, true)}
            <div className={styles.mapMarkers}>
              {region.markers.map((marker) => (
                <img
                  key={marker.id}
                  className={`${styles.mapMarker} ${styles[`${marker.type}Marker`]}`}
                  src={(region.markerIcons ?? MARKER_ICONS)[marker.type]}
                  alt={MARKER_LABELS[marker.type]}
                  draggable="false"
                  tabIndex={0}
                  style={{
                    '--marker-x': `${marker.x + (marker.offsetX ?? 0)}%`,
                    '--marker-y': `${marker.y + (marker.offsetY ?? 0)}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {atmosphere.showBirds && (
        <>
          <audio ref={birdAudioRef} className={styles.ambientAudio} src={birdSound} preload="none" />
          {!hasRegionBirdFlocks && showBirdFlocks && renderBirdFlocks()}
        </>
      )}
      <button
        className={styles.backButton}
        type="button"
        aria-label={`Back to ${parentName}`}
        disabled={isReturningToParent}
        onClick={returnToParent}
      >
        <FiArrowLeft aria-hidden="true" />
      </button>
      <div
        className={`${styles.qualityPanel} ${isQualityOpen ? styles.qualityPanelOpen : ''}`}
        onMouseEnter={() => setIsQualityOpen(true)}
        onMouseLeave={() => setIsQualityOpen(false)}
        onFocus={() => setIsQualityOpen(true)}
        onBlur={closeQualityPanelOnBlur}
      >
        <button
          className={styles.qualityToggle}
          type="button"
          aria-label={`${region.name} quality settings`}
          aria-expanded={isQualityOpen}
          onClick={() => setIsQualityOpen((current) => !current)}
        >
          <FiSliders aria-hidden="true" />
        </button>
        <div className={styles.qualityMenu} aria-label={`${region.name} quality`}>
          <span className={styles.qualityTitle}>{region.name} Quality</span>
          <div className={styles.qualityOptions}>
            {QUALITY_MODES.map((mode) => (
              <button
                key={mode.id}
                className={`${styles.qualityOption} ${quality === mode.id ? styles.qualityOptionActive : ''}`}
                type="button"
                aria-pressed={quality === mode.id}
                onClick={() => {
                  setQuality(mode.id)
                  setIsQualityOpen(false)
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.cameraControls} aria-label="Camera zoom">
        <button
          className={styles.cameraButton}
          type="button"
          aria-label="Zoom out"
          disabled={zoom <= MIN_ZOOM}
          onClick={() => updateZoom((currentZoom) => currentZoom - ZOOM_STEP)}
        >
          <FiMinus aria-hidden="true" />
        </button>
        <span className={styles.regionName}>{region.name}</span>
        <button
          className={styles.cameraButton}
          type="button"
          aria-label="Zoom in"
          disabled={zoom >= MAX_ZOOM}
          onClick={() => updateZoom((currentZoom) => currentZoom + ZOOM_STEP)}
        >
          <FiPlus aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

export default RegionMap



