import { createGlobalStyle } from 'styled-components'
import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'

const GlobalStyle = createGlobalStyle`
  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    &::after,
    &::before {
      box-sizing: border-box;
    }
  }

  html {
    font-size: 62.5%;
  }

`

export const muiTheme = createMuiTheme({
  popupIndicator: {
    padding: '2px',
  },
  clearIndicator: {
    padding: '2px',
  },
})

responsiveFontSizes(muiTheme)

export { GlobalStyle }
