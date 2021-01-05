import React from 'react'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles'

import Load from './utils/load'
import { GlobalStyle, muiTheme } from './styles/global'

import UserList from './components/UserList'
import { ErrorBoundary } from './components/ErrorBoundary'

import Dashboard from './components/Dashboard'
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
              <Route exact path="/businesses" component={UserList} />
              <Route exact path="/users" component={UserList} />
            </Switch>
          </Layout>
        </ErrorBoundary>
      </ThemeProvider>
    </Router>
  )
}

export default App
