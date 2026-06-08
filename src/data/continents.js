export const mapSize = {
  width: 1939,
  height: 811,
}

export const worldMapImage = new URL('../../img/globalmap/world_map.png', import.meta.url).href
export const windSound = new URL('../../sounds/wind/soundwind.mp3', import.meta.url).href
export const birdImage = new URL('../../img/bird/newbird.png', import.meta.url).href
export const birdSound = new URL('../../sounds/birds/birdsound.mp3', import.meta.url).href

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
    crest: new URL('../../img/herbs/herb_eridor.png', import.meta.url).href,
    glowColor: '#00ff3c',
    glowFill: 'rgba(0, 255, 60, 0.082)',
    glowOpacity: 1,
    glowStrength: 1,
    overlay: { x: 301, y: 272, width: 260, height: 160, crestSize: 112 },
  },
  {
    id: 'death',
    name: 'Death',
    image: new URL('../../img/continents/Death/death_continent.png', import.meta.url).href,
    crest: new URL('../../img/herbs/herb_death.png', import.meta.url).href,
    glowColor: '#ff0000',
    glowFill: 'rgba(255, 0, 0, 0.16)',
    glowOpacity: 1.18,
    glowStrength: 1.45,
    overlay: { x: 861, y: 374, width: 210, height: 150, crestSize: 96 },
  },
  {
    id: 'holyLights',
    name: 'Holy Lights',
    image: new URL('../../img/continents/HolyLights/holylight_continent.png', import.meta.url).href,
    crest: new URL('../../img/herbs/herb_holylight.png', import.meta.url).href,
    glowColor: '#ffbf00',
    glowFill: 'rgba(255, 191, 0, 0.115)',
    glowOpacity: 1.06,
    glowStrength: 1.18,
    overlay: { x: 1407, y: 275, width: 260, height: 165, crestSize: 118 },
  },
  {
    id: 'island',
    name: 'Magic Island',
    image: new URL('../../img/continents/Island/mage_continent.png', import.meta.url).href,
    crest: new URL('../../img/herbs/herb_mage.png', import.meta.url).href,
    glowColor: '#003cff',
    glowFill: 'rgba(0, 60, 255, 0.088)',
    glowOpacity: 1,
    glowStrength: 1,
    overlay: { x: 364, y: 596, width: 180, height: 130, crestSize: 78 },
  },
  {
    id: 'spindel',
    name: 'Spindel',
    image: new URL('../../img/continents/Spindel/secret_continent.png', import.meta.url).href,
    glowColor: '#d7f2ff',
    glowFill: 'rgba(215, 242, 255, 0.08)',
    glowOpacity: 0.94,
    glowStrength: 1.32,
    hideInfo: true,
    overlay: { x: 0, y: 0, width: 1, height: 1, crestSize: 1 },
  },
]
