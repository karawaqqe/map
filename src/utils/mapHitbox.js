const ALPHA_THRESHOLD = 8
const ROW_STEP = 1
const EDGE_PADDING = 0

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

export async function buildHitboxPath(src) {
  const image = await loadImage(src)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })

  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  context.drawImage(image, 0, 0)

  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height)
  const segments = []

  for (let y = 0; y < height; y += ROW_STEP) {
    let x = 0

    while (x < width) {
      const alpha = data[(y * width + x) * 4 + 3]

      if (alpha <= ALPHA_THRESHOLD) {
        x += 1
        continue
      }

      const start = x

      while (x < width && data[(y * width + x) * 4 + 3] > ALPHA_THRESHOLD) {
        x += 1
      }

      const left = Math.max(0, start - EDGE_PADDING)
      const right = Math.min(width, x + EDGE_PADDING)
      const bottom = Math.min(height, y + ROW_STEP)

      segments.push(`M${left} ${y}H${right}V${bottom}H${left}Z`)
    }
  }

  return segments.join('')
}
