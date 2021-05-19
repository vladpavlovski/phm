import React from 'react'
import { Switch, Route, Router } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import 'react-imported-component/macro'
import AdapterDayJs from '@material-ui/lab/AdapterDayjs'
import LocalizationProvider from '@material-ui/lab/LocalizationProvider'
import Load from './utils/load'
import { muiTheme, GlobalStyle } from './styles/global'

import { SnackbarProvider } from 'notistack'
import { LayoutProvider } from './context/layout/Provider'
import { OrganizationProvider } from './context/organization/Provider'
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
const AdminOrganizationsView = Load(() =>
  import('./admin/pages/Organization/view')
)
const AdminOrganization = Load(() => import('./admin/pages/Organization'))
const AdminOrganizationDashboard = Load(() =>
  import('./admin/pages/Organization/dashboard')
)
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
const AdminPerson = Load(() => import('./admin/pages/Person'))
const AdminPersonView = Load(() => import('./admin/pages/Person/view'))
const AdminUser = Load(() => import('./admin/pages/User'))
const AdminUserView = Load(() => import('./admin/pages/User/view'))
const AdminAward = Load(() => import('./admin/pages/Award'))
const AdminAwardView = Load(() => import('./admin/pages/Award/view'))
const AdminSystemSettings = Load(() => import('./admin/pages/SystemSettings'))
const AdminEvent = Load(() => import('./admin/pages/Event'))
const AdminEventView = Load(() => import('./admin/pages/Event/view'))
const AdminGame = Load(() => import('./admin/pages/Game'))
const AdminGameView = Load(() => import('./admin/pages/Game/view'))

dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)

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
                    <Switch>
                      <PrivateRoute exact path="/" component={Dashboard} />
                      <PrivateRoute
                        exact
                        path={ROUTES.ADMIN_DASHBOARD}
                        component={Dashboard}
                      />
                      <PrivateRoute
                        path={ROUTES.ADMIN_ORG_PLAYERS}
                        exact
                        component={AdminPlayersView}
                      />
                      <PrivateRoute
                        path={ROUTES.ADMIN_ORG_PLAYER}
                        exact
                        component={AdminPlayer}
                      />
                      <PrivateRoute
                        path={ROUTES.ADMIN_ORG_TEAMS}
                        exact
                        component={AdminTeamsView}
                      />
                      <PrivateRoute
                        path={ROUTES.ADMIN_ORG_TEAM}
                        exact
                        component={AdminTeam}
                      />
                      <PrivateRoute
                        path={ROUTES.ADMIN_ORGANIZATIONS}
                        exact
                        component={AdminOrganizationsView}
                      />
                      <PrivateRoute
                        path={ROUTES.ADMIN_ORGANIZATION}
                        exact
                        component={AdminOrganization}
                      />
                      <PrivateRoute
                        path={ROUTES.ADMIN_ORGANIZATION_DASHBOARD}
                        exact
                        component={AdminOrganizationDashboard}
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
                      <PrivateRoute
                        path={ROUTES.ADMIN_ORG_PERSONS}
                        exact
                        component={AdminPersonView}
                      />
                      <PrivateRoute
                        path={ROUTES.ADMIN_ORG_PERSON}
                        exact
                        component={AdminPerson}
                      />
                      <PrivateRoute
                        path={ROUTES.ADMIN_USERS}
                        exact
                        component={AdminUserView}
                      />
                      <PrivateRoute
                        path={ROUTES.ADMIN_USER}
                        exact
                        component={AdminUser}
                      />
                      <PrivateRoute
                        path={ROUTES.ADMIN_AWARDS}
                        exact
                        component={AdminAwardView}
                      />
                      <PrivateRoute
                        path={ROUTES.ADMIN_AWARD}
                        exact
                        component={AdminAward}
                      />
                      <PrivateRoute
                        path={ROUTES.ADMIN_SYSTEM_SETTINGS}
                        exact
                        component={AdminSystemSettings}
                      />

                      <PrivateRoute
                        path={ROUTES.ADMIN_EVENTS}
                        exact
                        component={AdminEventView}
                      />
                      <PrivateRoute
                        path={ROUTES.ADMIN_EVENT}
                        exact
                        component={AdminEvent}
                      />

                      <PrivateRoute
                        path={ROUTES.ADMIN_GAMES}
                        exact
                        component={AdminGameView}
                      />
                      <PrivateRoute
                        path={ROUTES.ADMIN_GAME}
                        exact
                        component={AdminGame}
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
              </OrganizationProvider>
            </SnackbarProvider>
          </Router>
        </ErrorBoundary>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
