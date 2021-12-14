import React from 'react'
import { Switch, Route } from 'react-router-dom'

import * as ROUTES from './routes'
import { PrivateRoute } from '../components/PrivateRoute'

import Dashboard from '../admin/pages/Dashboard/Dashboard'

import { GameEventFormProvider } from '../admin/pages/Game/play/context/Provider'
const NotFound = React.lazy(() => import('../pages/NotFound'))
const NetworkError = React.lazy(() => import('../pages/NetworkError'))

const AdminPlayersView = React.lazy(() => import('../admin/pages/Player/view'))
const AdminPlayer = React.lazy(() => import('../admin/pages/Player'))
const AdminTeamsView = React.lazy(() => import('../admin/pages/Team/view'))
const AdminTeam = React.lazy(() => import('../admin/pages/Team'))
const AdminOrganizationsView = React.lazy(
  () => import('../admin/pages/Organization/view')
)
const AdminOrganization = React.lazy(
  () => import('../admin/pages/Organization')
)
const AdminOrganizationDashboard = React.lazy(
  () => import('../admin/pages/Organization/dashboard')
)
const AdminCompetitionsView = React.lazy(
  () => import('../admin/pages/Competition/view')
)
const AdminCompetition = React.lazy(() => import('../admin/pages/Competition'))

const AdminSponsor = React.lazy(() => import('../admin/pages/Sponsor'))
const AdminSponsorsView = React.lazy(
  () => import('../admin/pages/Sponsor/view')
)
const AdminSeason = React.lazy(() => import('../admin/pages/Season'))
const AdminSeasonsView = React.lazy(() => import('../admin/pages/Season/view'))
const AdminVenue = React.lazy(() => import('../admin/pages/Venue'))
const AdminVenuesView = React.lazy(() => import('../admin/pages/Venue/view'))
const AdminRulePack = React.lazy(() => import('../admin/pages/RulePack'))
const AdminRulePacksView = React.lazy(
  () => import('../admin/pages/RulePack/view')
)
const AdminPerson = React.lazy(() => import('../admin/pages/Person'))
const AdminPersonView = React.lazy(() => import('../admin/pages/Person/view'))
const AdminUser = React.lazy(() => import('../admin/pages/User'))
const AdminUserView = React.lazy(() => import('../admin/pages/User/view'))
const AdminAward = React.lazy(() => import('../admin/pages/Award'))
const AdminAwardView = React.lazy(() => import('../admin/pages/Award/view'))
const AdminSystemSettings = React.lazy(
  () => import('../admin/pages/SystemSettings')
)
const AdminEvent = React.lazy(() => import('../admin/pages/Event'))
const AdminEventView = React.lazy(() => import('../admin/pages/Event/view'))
const AdminGame = React.lazy(() => import('../admin/pages/Game'))
const AdminGameView = React.lazy(() => import('../admin/pages/Game/view'))
const AdminGamePlay = React.lazy(() => import('../admin/pages/Game/play'))
const WebLeagueGames = React.lazy(() => import('../league/pages/Games'))
const WebLeagueGameReport = React.lazy(
  () => import('../league/pages/GameReport')
)
const WebLeaguePlayers = React.lazy(() => import('../league/pages/Players'))
const WebLeaguePlayersStatistics = React.lazy(
  () => import('../league/pages/PlayersStatistics')
)
const WebLeagueStandings = React.lazy(() => import('../league/pages/Standings'))

const RouteSwitcher: React.FC = () => {
  return (
    <Switch>
      <Route path={ROUTES.WEB_LEAGUE_GAMES} exact component={WebLeagueGames} />
      <Route
        path={ROUTES.WEB_LEAGUE_PLAYERS}
        exact
        component={WebLeaguePlayers}
      />
      <Route
        path={ROUTES.WEB_LEAGUE_PLAYERS_STATISTICS}
        exact
        component={WebLeaguePlayersStatistics}
      />
      <Route
        path={ROUTES.WEB_LEAGUE_STANDINGS}
        exact
        component={WebLeagueStandings}
      />
      <Route
        path={ROUTES.WEB_LEAGUE_GAME_REPORT}
        exact
        component={WebLeagueGameReport}
      />
      <PrivateRoute exact path="/" component={Dashboard} />

      <PrivateRoute exact path={ROUTES.ADMIN_DASHBOARD} component={Dashboard} />
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
      <PrivateRoute path={ROUTES.ADMIN_ORG_TEAM} exact component={AdminTeam} />
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
        path={ROUTES.ADMIN_ORG_COMPETITIONS}
        exact
        component={AdminCompetitionsView}
      />
      <PrivateRoute
        path={ROUTES.ADMIN_ORG_COMPETITION}
        exact
        component={AdminCompetition}
      />

      <PrivateRoute
        path={ROUTES.ADMIN_ORG_SPONSORS}
        exact
        component={AdminSponsorsView}
      />
      <PrivateRoute
        path={ROUTES.ADMIN_ORG_SPONSOR}
        exact
        component={AdminSponsor}
      />
      <PrivateRoute
        path={ROUTES.ADMIN_ORG_VENUES}
        exact
        component={AdminVenuesView}
      />
      <PrivateRoute
        path={ROUTES.ADMIN_ORG_VENUE}
        exact
        component={AdminVenue}
      />

      <PrivateRoute
        path={ROUTES.ADMIN_ORG_SEASONS}
        exact
        component={AdminSeasonsView}
      />
      <PrivateRoute
        path={ROUTES.ADMIN_ORG_SEASON}
        exact
        component={AdminSeason}
      />
      <PrivateRoute
        path={ROUTES.ADMIN_ORG_RULEPACKS}
        exact
        component={AdminRulePacksView}
      />
      <PrivateRoute
        path={ROUTES.ADMIN_ORG_RULEPACK}
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
      <PrivateRoute path={ROUTES.ADMIN_USERS} exact component={AdminUserView} />
      <PrivateRoute path={ROUTES.ADMIN_USER} exact component={AdminUser} />
      <PrivateRoute
        path={ROUTES.ADMIN_ORG_AWARDS}
        exact
        component={AdminAwardView}
      />
      <PrivateRoute
        path={ROUTES.ADMIN_ORG_AWARD}
        exact
        component={AdminAward}
      />
      <PrivateRoute
        path={ROUTES.ADMIN_SYSTEM_SETTINGS}
        exact
        component={AdminSystemSettings}
      />

      <PrivateRoute
        path={ROUTES.ADMIN_ORG_EVENTS}
        exact
        component={AdminEventView}
      />
      <PrivateRoute
        path={ROUTES.ADMIN_ORG_EVENT}
        exact
        component={AdminEvent}
      />

      <PrivateRoute
        path={ROUTES.ADMIN_ORG_GAMES}
        exact
        component={AdminGameView}
      />
      <PrivateRoute path={ROUTES.ADMIN_ORG_GAME} exact component={AdminGame} />
      <GameEventFormProvider>
        <PrivateRoute
          path={ROUTES.ADMIN_ORG_GAME_PLAY}
          exact
          component={AdminGamePlay}
        />
      </GameEventFormProvider>

      {/* {NEW ROUTES ADD BEFORE THIS ROW} */}
      <Route path={ROUTES.NETWORK_ERROR} exact component={NetworkError} />
      <Route path="*" component={NotFound} />
    </Switch>
  )
}

export { RouteSwitcher }
