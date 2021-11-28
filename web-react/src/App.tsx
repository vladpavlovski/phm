import React from 'react'
import { Router } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import objectSupport from 'dayjs/plugin/objectSupport'
import WebFont from 'webfontloader'
import theme from './styles/global'
import 'dayjs/locale/cs'
import AdapterDayJs from '@mui/lab/AdapterDayjs'
import LocalizationProvider from '@mui/lab/LocalizationProvider'

import { SnackbarProvider } from 'notistack'
import { LayoutProvider } from './context/layout/Provider'
import { OrganizationProvider } from './context/organization'
import { ErrorBoundary } from './components/ErrorBoundary'
import { RouteSwitcher } from './router/RouteSwitcher'
import { Loader } from './components/Loader'
const Layout = React.lazy(() => import('./components/Layout'))

const userLanguage = 'cs' // window?.navigator?.language
dayjs.locale(userLanguage)
dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(objectSupport)

type AppProps = {
  history: any
}

const App = ({ history }: AppProps) => {
  React.useEffect(() => {
    WebFont.load({
      custom: {
        families: ['Digital Numbers Regular'],
        urls: ['./styles/style.css'],
      },
    })
  }, [])

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayJs}>
          <CssBaseline />
          <ErrorBoundary>
            <Router history={history}>
              <React.Suspense fallback={<Loader />}>
                <SnackbarProvider maxSnack={5}>
                  <OrganizationProvider>
                    <LayoutProvider>
                      <Layout>
                        <RouteSwitcher />
                      </Layout>
                    </LayoutProvider>
                  </OrganizationProvider>
                </SnackbarProvider>
              </React.Suspense>
            </Router>
          </ErrorBoundary>
        </LocalizationProvider>
      </ThemeProvider>
    </React.StrictMode>
  )
}

export default App
