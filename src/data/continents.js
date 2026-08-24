export const mapSize = {
  width: 1939,
  height: 811,
}

export const worldMapImage = new URL('../../img/globalmap/world_map.webp', import.meta.url).href
export const windSound = new URL('../../sounds/wind/soundwind.mp3', import.meta.url).href
export const birdImage = new URL('../../img/bird/newbird.webp', import.meta.url).href
export const birdSound = new URL('../../sounds/birds/birdsound.mp3', import.meta.url).href
export const worldMapMusic = new URL('../../sounds/bg_music/Jeremy Derrick - The Quest of the Coast (SPOTISAVER).mp3', import.meta.url).href
export const eiridorMusic = new URL('../../sounds/bg_music/bg4.mp3', import.meta.url).href
export const holyLightMusic = new URL('../../sounds/bg_music/bg6.mp3', import.meta.url).href

export const cloudImages = [
  new URL('../../img/clouds/cloud1.webp', import.meta.url).href,
  new URL('../../img/clouds/cloud2.webp', import.meta.url).href,
  new URL('../../img/clouds/cloud3.webp', import.meta.url).href,
  new URL('../../img/clouds/cloud4.webp', import.meta.url).href,
  new URL('../../img/clouds/cloud5.webp', import.meta.url).href,
  new URL('../../img/clouds/cloud6.webp', import.meta.url).href,
  new URL('../../img/clouds/cloud7.webp', import.meta.url).href,
]

export const continents = [
  {
    id: 'eiridors',
    name: 'Eiridors',
    image: new URL('../../img/continents/Eiridors/cropped/Eiritor_continent.webp', import.meta.url).href,
    frame: { x: 88, y: 150, width: 685, height: 458 },
    crest: new URL('../../img/herbs/herb_eridor.webp', import.meta.url).href,
    glowColor: '#00ff3c',
    glowFill: 'rgba(0, 255, 60, 0.082)',
    glowOpacity: 1,
    glowStrength: 1,
    overlay: { x: 301, y: 272, width: 260, height: 160, crestSize: 112 },
  },
  {
    id: 'death',
    name: 'Death',
    image: new URL('../../img/continents/Death/cropped/death_continent.webp', import.meta.url).href,
    frame: { x: 786, y: 315, width: 360, height: 302 },
    crest: new URL('../../img/herbs/herb_death.webp', import.meta.url).href,
    glowColor: '#ff0000',
    glowFill: 'rgba(255, 0, 0, 0.16)',
    glowOpacity: 1.18,
    glowStrength: 1.45,
    overlay: { x: 861, y: 374, width: 210, height: 150, crestSize: 96 },
  },
  {
    id: 'holyLights',
    name: 'Holy Lights',
    image: new URL('../../img/continents/HolyLights/cropped/holylight_continent.webp', import.meta.url).href,
    frame: { x: 1176, y: 116, width: 720, height: 539 },
    crest: new URL('../../img/herbs/herb_holylight.webp', import.meta.url).href,
    glowColor: '#ffbf00',
    glowFill: 'rgba(255, 191, 0, 0.115)',
    glowOpacity: 1.06,
    glowStrength: 1.18,
    overlay: { x: 1407, y: 275, width: 260, height: 165, crestSize: 118 },
  },
  {
    id: 'island',
    name: 'Magic Island',
    image: new URL('../../img/continents/Island/cropped/mage_continent.webp', import.meta.url).href,
    frame: { x: 309, y: 591, width: 290, height: 198 },
    crest: new URL('../../img/herbs/herb_mage.webp', import.meta.url).href,
    glowColor: '#003cff',
    glowFill: 'rgba(0, 60, 255, 0.088)',
    glowOpacity: 1,
    glowStrength: 1,
    overlay: { x: 364, y: 596, width: 180, height: 130, crestSize: 78 },
  },
  {
    id: 'spindel',
    name: 'Spindel',
    image: new URL('../../img/continents/Spindel/cropped/secret_continent.webp', import.meta.url).href,
    frame: { x: 1250, y: 22, width: 73, height: 49 },
    glowColor: '#d7f2ff',
    glowFill: 'rgba(215, 242, 255, 0.08)',
    glowOpacity: 0.94,
    glowStrength: 1.32,
    hideInfo: true,
    overlay: { x: 0, y: 0, width: 1, height: 1, crestSize: 1 },
  },
]
