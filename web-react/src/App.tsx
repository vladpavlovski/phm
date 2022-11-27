import 'dayjs/locale/cs'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import objectSupport from 'dayjs/plugin/objectSupport'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { History } from 'history'
import { SnackbarProvider } from 'notistack'
import React from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { Router } from 'react-router-dom'
import WebFont from 'webfontloader'
import CssBaseline from '@mui/material/CssBaseline'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Loader } from './components/Loader'
import { LayoutProvider } from './context/layout/Provider'
import { OrganizationProvider } from './context/organization'
import { RouteSwitcher } from './router/RouteSwitcher'
import theme from './styles/global'

const Layout = React.lazy(() => import('./components/Layout'))

const userLanguage = 'cs' // window?.navigator?.language
dayjs.locale(userLanguage)
dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(objectSupport)

type TApp = {
  history: History
}

WebFont.load({
  custom: {
    families: ['Digital Numbers Regular'],
    urls: ['./styles/style.css'],
  },
})

const App: React.FC<TApp> = ({ history }) => {
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline />
          <ErrorBoundary>
            <Router history={history}>
              <React.Suspense fallback={<Loader />}>
                <HelmetProvider>
                  <SnackbarProvider maxSnack={5}>
                    <OrganizationProvider>
                      <LayoutProvider>
                        <StyledEngineProvider injectFirst>
                          <Layout>
                            <RouteSwitcher />
                          </Layout>
                        </StyledEngineProvider>
                      </LayoutProvider>
                    </OrganizationProvider>
                  </SnackbarProvider>
                </HelmetProvider>
              </React.Suspense>
            </Router>
          </ErrorBoundary>
        </LocalizationProvider>
      </ThemeProvider>
    </React.StrictMode>
  )
}

export default App
