import React from 'react'
import { Switch, Route, Router } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'

import AdapterDayJs from '@material-ui/lab/AdapterDayjs'
import LocalizationProvider from '@material-ui/lab/LocalizationProvider'
import Load from './utils/load'
import { muiTheme, GlobalStyle } from './styles/global'

import { SnackbarProvider } from 'notistack'
import { LayoutProvider } from './context/layout/Provider'
import { ErrorBoundary } from './components/ErrorBoundary'
import * as ROUTES from './routes'
import { PrivateRoute } from './components/PrivateRoute'

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

const AdminSponsor = Load(() => import('./admin/pages/Sponsor'))
const AdminSponsorsView = Load(() => import('./admin/pages/Sponsor/view'))
const AdminSeason = Load(() => import('./admin/pages/Season'))
const AdminSeasonsView = Load(() => import('./admin/pages/Season/view'))
const AdminVenue = Load(() => import('./admin/pages/Venue'))
const AdminVenuesView = Load(() => import('./admin/pages/Venue/view'))
const AdminRulePack = Load(() => import('./admin/pages/RulePack'))
const AdminRulePacksView = Load(() => import('./admin/pages/RulePack/view'))

dayjs.extend(duration)
dayjs.extend(utc)

const App = ({ history }) => {
  return (
    <ThemeProvider theme={muiTheme}>
      <GlobalStyle />
      <LocalizationProvider dateAdapter={AdapterDayJs}>
        <CssBaseline />
        <ErrorBoundary>
          <Router history={history}>
            <SnackbarProvider maxSnack={5}>
              <LayoutProvider>
                <Layout>
                  <Switch>
                    <PrivateRoute exact path="/" component={Dashboard} />
                    <PrivateRoute
                      exact
                      path={ROUTES.ADMIN_DASHBOARD}
                      component={Dashboard}
                    />
                    <PrivateRoute
                      path={ROUTES.ADMIN_PLAYERS}
                      exact
                      component={AdminPlayersView}
                    />
                    <PrivateRoute
                      path={ROUTES.ADMIN_PLAYER}
                      exact
                      component={AdminPlayer}
                    />
                    <PrivateRoute
                      path={ROUTES.ADMIN_TEAMS}
                      exact
                      component={AdminTeamsView}
                    />
                    <PrivateRoute
                      path={ROUTES.ADMIN_TEAM}
                      exact
                      component={AdminTeam}
                    />
                    <PrivateRoute
                      path={ROUTES.ADMIN_ASSOCIATIONS}
                      exact
                      component={AdminAssociationsView}
                    />
                    <PrivateRoute
                      path={ROUTES.ADMIN_ASSOCIATION}
                      exact
                      component={AdminAssociation}
                    />
                    <PrivateRoute
                      path={ROUTES.ADMIN_COMPETITIONS}
                      exact
                      component={AdminCompetitionsView}
                    />
                    <PrivateRoute
                      path={ROUTES.ADMIN_COMPETITION}
                      exact
                      component={AdminCompetition}
                    />

                    <PrivateRoute
                      path={ROUTES.ADMIN_SPONSORS}
                      exact
                      component={AdminSponsorsView}
                    />
                    <PrivateRoute
                      path={ROUTES.ADMIN_SPONSOR}
                      exact
                      component={AdminSponsor}
                    />
                    <PrivateRoute
                      path={ROUTES.ADMIN_VENUES}
                      exact
                      component={AdminVenuesView}
                    />
                    <PrivateRoute
                      path={ROUTES.ADMIN_VENUE}
                      exact
                      component={AdminVenue}
                    />

                    <PrivateRoute
                      path={ROUTES.ADMIN_SEASONS}
                      exact
                      component={AdminSeasonsView}
                    />
                    <PrivateRoute
                      path={ROUTES.ADMIN_SEASON}
                      exact
                      component={AdminSeason}
                    />
                    <PrivateRoute
                      path={ROUTES.ADMIN_RULEPACKS}
                      exact
                      component={AdminRulePacksView}
                    />
                    <PrivateRoute
                      path={ROUTES.ADMIN_RULEPACK}
                      exact
                      component={AdminRulePack}
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
