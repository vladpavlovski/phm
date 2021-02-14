import React from 'react'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'

import AdapterDayJs from '@material-ui/lab/AdapterDayjs'
import LocalizationProvider from '@material-ui/lab/LocalizationProvider'
import Load from './utils/load'
import { muiTheme } from './styles/global'

import { SnackbarProvider } from 'notistack'
import { LayoutProvider } from './context/layout/Provider'
import { ErrorBoundary } from './components/ErrorBoundary'
import * as ROUTES from './routes'

import Dashboard from './admin/pages/Dashboard/Dashboard'
const Layout = Load(() => import('./components/Layout'))
const NotFound = Load(() => import('./pages/NotFound'))
const NetworkError = Load(() => import('./pages/NetworkError'))

const AdminPlayersView = Load(() => import('./admin/pages/Player/view'))
const AdminPlayer = Load(() => import('./admin/pages/Player'))
const AdminTeamsView = Load(() => import('./admin/pages/Team/view'))
const AdminTeam = Load(() => import('./admin/pages/Team'))
const AdminAssociationsView = Load(() =>
  import('./admin/pages/Association/view')
)
const AdminAssociation = Load(() => import('./admin/pages/Association'))
const AdminCompetitionsView = Load(() =>
  import('./admin/pages/Competition/view')
)
const AdminCompetition = Load(() => import('./admin/pages/Competition'))

const App = () => {
  return (
    <ThemeProvider theme={muiTheme}>
      <LocalizationProvider dateAdapter={AdapterDayJs}>
        <CssBaseline />
        <ErrorBoundary>
          <Router>
            <SnackbarProvider maxSnack={5}>
              <LayoutProvider>
                <Layout>
                  <Switch>
                    <Route exact path="/" component={Dashboard} />
                    <Route
                      exact
                      path={ROUTES.ADMIN_DASHBOARD}
                      component={Dashboard}
                    />
                    <Route
                      path={ROUTES.ADMIN_PLAYERS}
                      exact
                      component={AdminPlayersView}
                    />
                    <Route
                      path={ROUTES.ADMIN_PLAYER}
                      exact
                      component={AdminPlayer}
                    />
                    <Route
                      path={ROUTES.ADMIN_TEAMS}
                      exact
                      component={AdminTeamsView}
                    />
                    <Route
                      path={ROUTES.ADMIN_TEAM}
                      exact
                      component={AdminTeam}
                    />
                    <Route
                      path={ROUTES.ADMIN_ASSOCIATIONS}
                      exact
                      component={AdminAssociationsView}
                    />
                    <Route
                      path={ROUTES.ADMIN_ASSOCIATION}
                      exact
                      component={AdminAssociation}
                    />
                    <Route
                      path={ROUTES.ADMIN_COMPETITIONS}
                      exact
                      component={AdminCompetitionsView}
                    />
                    <Route
                      path={ROUTES.ADMIN_COMPETITION}
                      exact
                      component={AdminCompetition}
                    />

                    {/* {NEW ROUTES ADD BEFORE THIS ROW} */}
                    <Route
                      path={ROUTES.NETWORK_ERROR}
                      exact
                      component={NetworkError}
                    />
                    <Route path="*" exact component={NotFound} />
                  </Switch>
                </Layout>
              </LayoutProvider>
            </SnackbarProvider>
          </Router>
        </ErrorBoundary>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
