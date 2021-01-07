import React from 'react'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles'

import Load from './utils/load'
import { GlobalStyle, muiTheme } from './styles/global'

import { LayoutProvider } from './context/layout/Provider'
import { ErrorBoundary } from './components/ErrorBoundary'
import * as ROUTES from './routes'

import Dashboard from './admin/pages/Dashboard/Dashboard'
const Layout = Load(() => import('./components/Layout'))
const PlayersView = Load(() => import('./admin/pages/Player/view'))
const NotFound = Load(() => import('./pages/NotFound'))
const NetworkError = Load(() => import('./pages/NetworkError'))

const App = () => {
  return (
    <Router>
      <ThemeProvider theme={muiTheme}>
        <GlobalStyle />
        <ErrorBoundary>
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
                  component={PlayersView}
                />
                <Route
                  path={ROUTES.NETWORK_ERROR}
                  exact
                  component={NetworkError}
                />
                <Route path="*" exact component={NotFound} />
              </Switch>
            </Layout>
          </LayoutProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </Router>
  )
}

export default App
