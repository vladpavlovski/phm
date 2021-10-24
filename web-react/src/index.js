import React from 'react'
import ReactDOM from 'react-dom'
import { Bugfender } from '@bugfender/sdk'
import { createBrowserHistory } from 'history'
import './styles/style.css'
import App from './App'
// import registerServiceWorker from './registerServiceWorker'
import { Auth0Provider } from '@auth0/auth0-react'
import { LicenseInfo } from '@mui/x-data-grid-pro'
import config from './config'
import { CachePersistor } from 'apollo-cache-persist'
import { setContext } from '@apollo/client/link/context'
import {
  ApolloProvider,
  ApolloClient,
  HttpLink,
  InMemoryCache,
  from,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import createAuth0Client from '@auth0/auth0-spa-js'
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

const onRedirectCallback = appState => {
  // Use the router's history module to replace the url
  history.replace(appState?.returnTo || window.location.pathname)
}

/* Make sure auth0 client is available before AuthProvider gets assigned */
createAuth0Client({
  domain: config.auth0Domain,
  client_id: config.auth0ClientId,
  audience: config.auth0Audience,
  redirect_uri: window.location.origin,
}).then(auth0 => {
  const auth0Client = auth0

  /* Set URI for all Apollo GraphQL requests (backend api) */
  const httpLink = new HttpLink({
    uri: config.graphqlUri || '/graphql',
    // fetchOptions: { credentials: 'same-origin' },
  })

  /* Set in-memory token to reduce async requests */
  let token

  const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations }) => {
          console.error(
            `[GraphQL error]: Operation: ${
              operation.operationName
            }, Message: ${message}, Location: ${JSON.stringify(locations)}`
          )
          !config.dev &&
            Bugfender.sendIssue(
              '[GraphQL error]',
              `Operation: ${
                operation.operationName
              }, ${message}, Location: ${JSON.stringify(locations)}`
            )
        })
      // TODO: solution for network errors
      if (networkError) {
        console.error(`[Network error]: ${networkError}`)
        !config.dev && Bugfender.sendIssue('[Network error]', `${networkError}`)
      }
      forward(operation)
    }
  )

  /* Create Apollo Link to supply token with either
   * in-memory ref or auth0 req'ed token or redirect (built into
   * getTokenSilently
   */
  const withTokenLink = setContext(async () => {
    // return token if there
    if (token) return { auth0Token: token }

    // else check if valid token exists with client already and set if so
    let newToken
    try {
      newToken = await auth0Client.getTokenSilently()
    } catch (e) {
      console.error(e)
    }

    token = newToken
    return { auth0Token: newToken }
  })

  /* Create Apollo Link to supply token in auth header with every gql request */
  const authLink = setContext((_, { headers, auth0Token }) => ({
    headers: {
      ...headers,
      ...(auth0Token ? { authorization: `Bearer ${auth0Token}` } : {}),
    },
  }))

  /* Create Apollo Link array to pass to Apollo Client */
  const link = from([errorLink, withTokenLink, authLink, httpLink])

  /* Set up local cache */
  const cache = new InMemoryCache()

  /* Create Apollo Client */
  const client = new ApolloClient({
    link,
    cache,
  })

  /* Create persistor to handle persisting data from local storage on refresh, etc */
  const persistor = new CachePersistor({ cache, storage: window.localStorage })

  /* Create root render function */
  const renderApp = () => {
    ReactDOM.render(
      <ApolloProvider client={client}>
        <Auth0Provider
          domain={config.auth0Domain}
          clientId={config.auth0ClientId}
          redirectUri={window.location.origin}
          audience={config.auth0Audience}
          onRedirectCallback={onRedirectCallback}
          useRefreshTokens={true}
        >
          <App history={history} />
        </Auth0Provider>
      </ApolloProvider>,
      document.getElementById('root')
    )
  }

  /* Render React App after hydrating from local storage */
  persistor.restore().then(() => {
    renderApp(App)
  })
})
// registerServiceWorker()
