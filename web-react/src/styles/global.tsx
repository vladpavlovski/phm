// import { createTheme, responsiveFontSizes } from '@mui/material/styles'

// declare module '@mui/material/styles' {
//   interface Theme {
//     overrides: {
//       MuiAutocomplete: {
//         popper: {
//           zIndex: number
//         }
//       }
//     }
//   }
//   // allow configuration using `createTheme`
//   interface ThemeOptions {
//     overrides?: {
//       MuiAutocomplete: {
//         popper: {
//           zIndex: number
//         }
//       }
//     }
//   }
// }

// export const muiTheme = createTheme({
//   overrides: {
//     MuiAutocomplete: {
//       popper: { zIndex: 1350 },
//     },
//   },
// })

// responsiveFontSizes(muiTheme)
import { createTheme, responsiveFontSizes } from '@mui/material/styles'

const theme = createTheme()
export default responsiveFontSizes(theme)
