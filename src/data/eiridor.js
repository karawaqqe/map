export const eiridorMapSize = {
  width: 1387,
  height: 1134,
}

export const eiridorMapImage = new URL('../../img/cubes/EIridor/ieridormap.png', import.meta.url).href

export const eiridorRegions = [
  {
    id: 'morveyn',
    name: 'Morveyn',
    image: new URL('../../img/cubes/EIridor/part1.png', import.meta.url).href,
    glowColor: '#b56a3d',
    glowFill: 'rgba(181, 106, 61, 0.15)',
    glowOpacity: 0.9,
    glowStrength: 1.1,
  },
  {
    id: 'valdora',
    name: 'Valdora',
    image: new URL('../../img/cubes/EIridor/part2.png', import.meta.url).href,
    glowColor: '#8dc76f',
    glowFill: 'rgba(141, 199, 111, 0.12)',
    glowOpacity: 0.92,
    glowStrength: 1,
  },
  {
    id: 'drakenholm',
    name: 'Drakenholm',
    image: new URL('../../img/cubes/EIridor/part3.png', import.meta.url).href,
    glowColor: '#d1a95d',
    glowFill: 'rgba(209, 169, 93, 0.14)',
    glowOpacity: 0.88,
    glowStrength: 1.05,
  },
  {
    id: 'noktreyn',
    name: 'Noktreyn',
    image: new URL('../../img/cubes/EIridor/part4.png', import.meta.url).href,
    glowColor: '#cad7d3',
    glowFill: 'rgba(202, 215, 211, 0.12)',
    glowOpacity: 0.86,
    glowStrength: 0.95,
  },
  {
    id: 'lyumeris',
    name: 'Lyumeris',
    image: new URL('../../img/cubes/EIridor/part5.png', import.meta.url).href,
    glowColor: '#d7c26a',
    glowFill: 'rgba(215, 194, 106, 0.13)',
    glowOpacity: 0.94,
    glowStrength: 1.08,
  },
]
