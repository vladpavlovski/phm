import { ApolloClient, HttpLink, InMemoryCache, concat } from '@apollo/client'
//https://harsh-patel.medium.com/handle-and-inspect-network-errors-in-your-graphql-client-side-ae5e4fafc08
//https://hasura.io/blog/handling-graphql-hasura-errors-with-react/

import { onError } from '@apollo/client/link/error'

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_URI || '/graphql',
})

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  console.error(`[GraphQL error]: Operation: ${operation.operationName}`)
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
          locations
        )}`
      )
    })

  if (networkError) console.error(`[Network error]: ${networkError}`)
})

const client = new ApolloClient({
  link: concat(errorLink, httpLink),
  cache: new InMemoryCache(),
})

export { client }
