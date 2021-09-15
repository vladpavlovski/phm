import { createGlobalStyle } from 'styled-components'
import { createTheme, responsiveFontSizes } from '@mui/material/styles'

export const GlobalStyle = createGlobalStyle`
  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    &::after,
    &::before {
      box-sizing: border-box;
    }
  }

  /* html {
    font-size: 62.5%;
  } */

  div[role="tooltip"], div[role="presentation"] {
    z-index: 1350;
  }

`

export const muiTheme = createTheme({
  // typography: {
  //   htmlFontSize: 10,
  // },
  popupIndicator: {
    padding: '2px',
  },
  clearIndicator: {
    padding: '2px',
  },
  overrides: {
    MuiInputBase: {
      input: {
        '&:-webkit-autofill': {
          transitionDelay: '9999s',
          transitionProperty: 'background-color, color',
        },
      },
    },
    MuiAutocomplete: {
      popper: { zIndex: 1350 },
    },
  },
})

responsiveFontSizes(muiTheme)
