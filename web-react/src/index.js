import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/client'
import { Bugfender } from '@bugfender/sdk'

import App from './App'
import registerServiceWorker from './registerServiceWorker'
import { client } from './graphql'

Bugfender.init({
  appKey: process.env.REACT_APP_BUGFENDER_KEY,
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

const Main = () => (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)

ReactDOM.render(<Main />, document.getElementById('root'))
registerServiceWorker()
