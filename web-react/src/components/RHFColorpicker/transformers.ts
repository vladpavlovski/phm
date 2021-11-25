export const DEFAULT_CONVERTER = 'rgba_hex'

export const converters: {
  [key: string]: Function
} = {
  rgba: (c: {
    rgb: {
      r: number
      g: number
      b: number
      a?: number
    }
  }): string => `rgba(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}, ${c.rgb.a})`,
  rgb: (c: {
    rgb: {
      r: number
      g: number
      b: number
    }
  }): string => `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`,
  hex: (c: { hex: string }): string => c.hex,
  rgba_rgb: (c: {
    rgb: {
      r: number
      g: number
      b: number
      a: number
    }
  }) => (c.rgb.a === 1 ? converters.rgb(c) : converters.rgba(c)),
  rgba_hex: (c: {
    rgb: {
      r: number
      g: number
      b: number
      a?: number
    }
    hex: string
  }) => (c.rgb.a === 1 ? converters.hex(c) : converters.rgba(c)),
}

export default converters
