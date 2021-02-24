import React from 'react'
import ReactDOM from 'react-dom'
import { Bugfender } from '@bugfender/sdk'

import App from './App'
import registerServiceWorker from './registerServiceWorker'
import { AuthorizedApolloProvider } from './graphql'
import { Auth0Provider } from '@auth0/auth0-react'
import config from './config'

if (config.environment !== 'development') {
  Bugfender.init({
    appKey: config.bugfenderKey,
    // apiURL: 'https://api.bugfender.com',
    // baseURL: 'https://dashboard.bugfender.com',
    // overrideConsoleMethods: true,
    // printToConsole: true,
    // registerErrorHandler: true,
    // logBrowserEvents: true,
    // logUIEvents: true,
    // version: '',
    // build: '',
  })
}

const Main = () => (
  <Auth0Provider
    domain={config.auth0Domain}
    clientId={config.auth0ClientId}
    redirectUri={window.location.origin}
    audience={config.auth0Audience}
  >
    <AuthorizedApolloProvider>
      <App />
    </AuthorizedApolloProvider>
  </Auth0Provider>
)

ReactDOM.render(<Main />, document.getElementById('root'))
registerServiceWorker()
