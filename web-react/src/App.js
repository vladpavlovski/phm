import React from 'react'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles'

import Load from './utils/load'
import { GlobalStyle, muiTheme } from './styles/global'

import { ErrorBoundary } from './components/ErrorBoundary'
import * as ROUTES from './routes'

import Dashboard from './admin/pages/Dashboard/Dashboard'
const Layout = Load(() => import('./components/Layout'))

const App = () => {
  return (
    <Router>
      <ThemeProvider theme={muiTheme}>
        <GlobalStyle />
        <ErrorBoundary>
          <Layout>
            <Switch>
              <Route exact path="/" component={Dashboard} />
              <Route exact path={ROUTES.DASHBOARD} component={Dashboard} />
            </Switch>
          </Layout>
        </ErrorBoundary>
      </ThemeProvider>
    </Router>
  )
}

export default App
