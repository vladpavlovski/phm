import { ApolloClient, HttpLink, InMemoryCache, concat } from '@apollo/client'
// import { offsetLimitPagination } from '@apollo/client/utilities'

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

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
  }
})

const cache = new InMemoryCache({
  typePolicies: {
    Player: {
      keyFields: ['playerId'],
    },
    Query: {
      fields: {
        Player: {
          read(existing, { args: { filter, offset, first } }) {
            // A read function should always return undefined if existing is
            // undefined. Returning undefined signals that the field is
            // missing from the cache, which instructs Apollo Client to
            // fetch its value from your GraphQL server.
            // console.log(
            //   'existing, filter, offset, first: ',
            //   existing,
            //   filter,
            //   offset,
            //   first
            // )
            if (filter && !Object.values(filter).every(o => o === '')) {
              return undefined
            }
            if (!filter && !offset && !first) {
              return undefined
            }
            return existing && existing.slice(offset, offset + first)
          },
          keyArgs: ['playerId'],
          merge(existing, incoming, { args: { offset = 0 } }) {
            // Slicing is necessary because the existing data is
            // immutable, and frozen in development.
            const merged = existing ? existing.slice(0) : []
            for (let i = 0; i < incoming.length; ++i) {
              merged[offset + i] = incoming[i]
            }
            return merged
          },
        },
      },
    },
  },
})

const client = new ApolloClient({
  link: concat(errorLink, httpLink),
  cache,
})

export { client }
