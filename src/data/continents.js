export const mapSize = {
  width: 1939,
  height: 811,
}

export const worldMapImage = new URL('../../img/globalmap/world_map.png', import.meta.url).href
export const windSound = new URL('../../sounds/wind/soundwind.mp3', import.meta.url).href

export const cloudImages = [
  new URL('../../img/clouds/cloud1.png', import.meta.url).href,
  new URL('../../img/clouds/cloud2.png', import.meta.url).href,
  new URL('../../img/clouds/cloud3.png', import.meta.url).href,
  new URL('../../img/clouds/cloud4.png', import.meta.url).href,
  new URL('../../img/clouds/cloud5.png', import.meta.url).href,
  new URL('../../img/clouds/cloud6.png', import.meta.url).href,
  new URL('../../img/clouds/cloud7.png', import.meta.url).href,
]

export const continents = [
  {
    id: 'eiridors',
    name: 'Eiridors',
    image: new URL('../../img/continents/Eiridors/Eiritor_continent.png', import.meta.url).href,
    glowColor: '#8fe66d',
    glowFill: 'rgba(143, 230, 109, 0.045)',
  },
  {
    id: 'death',
    name: 'Death',
    image: new URL('../../img/continents/Death/death_continent.png', import.meta.url).href,
    glowColor: '#ff5346',
    glowFill: 'rgba(255, 83, 70, 0.045)',
  },
  {
    id: 'holyLights',
    name: 'Holy Lights',
    image: new URL('../../img/continents/HolyLights/holylight_continent.png', import.meta.url).href,
    glowColor: '#ffd66b',
    glowFill: 'rgba(255, 214, 107, 0.045)',
  },
  {
    id: 'island',
    name: 'Island',
    image: new URL('../../img/continents/Island/mage_continent.png', import.meta.url).href,
    glowColor: '#5da8ff',
    glowFill: 'rgba(93, 168, 255, 0.045)',
  },
]
