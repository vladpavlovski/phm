import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/client'

import App from './App'
import registerServiceWorker from './registerServiceWorker'
import { client } from './graphql'

const Main = () => (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)

ReactDOM.render(<Main />, document.getElementById('root'))
registerServiceWorker()
