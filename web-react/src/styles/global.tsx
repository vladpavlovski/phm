import { createTheme, responsiveFontSizes } from '@mui/material/styles'

export const muiTheme = createTheme({
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
