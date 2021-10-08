import React from 'react'
import { Router } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import objectSupport from 'dayjs/plugin/objectSupport'

import 'react-imported-component/macro'
import 'dayjs/locale/cs'
import AdapterDayJs from '@mui/lab/AdapterDayjs'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import Load from './utils/load'
import { muiTheme, GlobalStyle } from './styles/global'

import { SnackbarProvider } from 'notistack'
import { LayoutProvider } from './context/layout/Provider'
import { OrganizationProvider } from './context/organization/Provider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { RouteSwitcher } from './router/RouteSwitcher'

const Layout = Load(() => import('./components/Layout'))

const userLanguage = 'cs' // window?.navigator?.language
dayjs.locale(userLanguage)
dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(objectSupport)

const App = ({ history }) => {
  return (
    <ThemeProvider theme={muiTheme}>
      <GlobalStyle />
      <LocalizationProvider dateAdapter={AdapterDayJs}>
        <CssBaseline />
        <ErrorBoundary>
          <Router history={history}>
            <SnackbarProvider maxSnack={5}>
              <OrganizationProvider>
                <LayoutProvider>
                  <Layout>
                    <RouteSwitcher />
                  </Layout>
                </LayoutProvider>
              </OrganizationProvider>
            </SnackbarProvider>
          </Router>
        </ErrorBoundary>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
