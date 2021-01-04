import { css } from 'styled-components'

export const sizes = {
  xxxs: 320,
  xxs: 480,
  xs: 736,
  sm: 960,
  md: 1280,
  lg: 1690,
}

const media = Object.keys(sizes).reduce((acc, label) => {
  acc[label] = (...args) => css`
    @media (min-width: ${sizes[label]}px) {
      ${css(...args)};
    }
  `
  return acc
}, {})

export default media
