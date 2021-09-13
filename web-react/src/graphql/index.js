import React from 'react'
import { Bugfender } from '@bugfender/sdk'
import {
  ApolloProvider,
  ApolloClient,
  HttpLink,
  InMemoryCache,
  from,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { useAuth0 } from '@auth0/auth0-react'
import { onError } from '@apollo/client/link/error'
import config from '../config'
const cache = new InMemoryCache()

const AuthorizedApolloProvider = ({ children }) => {
  const { getAccessTokenSilently } = useAuth0()

  const httpLink = new HttpLink({
    uri: config.graphqlUri || '/graphql',
  })

  const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward }) => {
      console.error(`[GraphQL error]: Operation: ${operation.operationName}`)
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations }) => {
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
              locations
            )}`
          )
          !config.dev &&
            Bugfender.sendIssue(
              '[GraphQL error]',
              `${message}, Location: ${JSON.stringify(locations)}`
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

  const authLink = setContext(async (_, { headers, ...context }) => {
    const token = await getAccessTokenSilently()

    return {
      headers: {
        ...headers,
        ...(token && { authorization: token ? `Bearer ${token}` : '' }),
      },
      ...context,
    }
  })

  const client = new ApolloClient({
    link: from([httpLink, authLink, errorLink]),
    cache,
    connectToDevTools: config.dev,
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export { AuthorizedApolloProvider }
