import './styles/style.css'
import { createBrowserHistory } from 'history'
import React from 'react'
import ReactDOM from 'react-dom'
import { AppState, Auth0Provider } from '@auth0/auth0-react'
import { Bugfender } from '@bugfender/sdk'
import { LicenseInfo } from '@mui/x-data-grid-pro'
import App from './App'
import config from './config'
// import registerServiceWorker from './registerServiceWorker'
import { AuthorizedApolloProvider } from './graphql'

LicenseInfo.setLicenseKey(config.xGridKey)

if (!config.dev) {
  Bugfender.init({
    appKey: config.bugfenderKey,
    // apiURL: 'https://api.bugfender.com',
    // baseURL: 'https://dashboard.bugfender.com',
    overrideConsoleMethods: true,
    printToConsole: true,
    registerErrorHandler: true,
    logBrowserEvents: true,
    logUIEvents: true,
    // version: '',
    // build: '',
  })
}

const history = createBrowserHistory()

const onRedirectCallback = (appState?: AppState): void => {
  // Use the router's history module to replace the url
  history.replace(appState?.returnTo || window.location.pathname)
}

const Main = () => {
  return (
    <Auth0Provider
      domain={config.auth0Domain}
      clientId={config.auth0ClientId}
      redirectUri={window.location.origin}
      audience={config.auth0Audience}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens={true}
    >
      <AuthorizedApolloProvider>
        {() => <App history={history} />}
      </AuthorizedApolloProvider>
    </Auth0Provider>
  )
}

ReactDOM.render(<Main />, document.getElementById('root') as HTMLElement)
// registerServiceWorker()
