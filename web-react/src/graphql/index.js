import React from 'react'
import {
  ApolloProvider,
  ApolloClient,
  HttpLink,
  InMemoryCache,
  // concat,
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
        })
      // TODO: solution for network errors
      if (networkError) {
        console.error(`[Network error]: ${networkError}`)
      }
      forward(operation)
    }
  )

  const authLink = setContext(async (_, { headers }) => {
    const token = await getAccessTokenSilently()

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    }
  })

  const client = new ApolloClient({
    link: authLink.concat(httpLink, errorLink),
    cache,
    connectToDevTools: config.environment === 'development',
  })

  // const apolloClient = new ApolloClient({
  //   link: authLink.concat(httpLink),
  //   cache: new InMemoryCache(),
  //   connectToDevTools: true,
  // })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export { AuthorizedApolloProvider }

// const mergeArrayByField = fieldName => (
//   existing,
//   incoming,
//   { readField, mergeObjects }
// ) => {
//   const merged = existing ? existing.slice(0) : []
//   const authorNameToIndex = Object.create(null)
//   if (existing) {
//     existing.forEach((author, index) => {
//       authorNameToIndex[readField(fieldName, author)] = index
//     })
//   }
//   incoming.forEach(author => {
//     const name = readField(fieldName, author)
//     const index = authorNameToIndex[name]
//     if (typeof index === 'number') {
//       // Merge the new author data with the existing author data.
//       merged[index] = mergeObjects(merged[index], author)
//     } else {
//       // First time we've seen this author in this array.
//       authorNameToIndex[name] = merged.length
//       merged.push(author)
//     }
//   })
//   console.log('merged: ', merged)
//   return merged
// }

// const cacheRead = (existing, { args: { filter, offset = 0, first } }) => {
//   // A read function should always return undefined if existing is
//   // undefined. Returning undefined signals that the field is
//   // missing from the cache, which instructs Apollo Client to
//   // fetch its value from your GraphQL server.
//   // console.log(
//   //   'existing, filter, offset, first: ',
//   //   existing,
//   //   filter,
//   //   offset,
//   //   first
//   // )
//   if (filter && !Object.values(filter).every(o => o === '')) {
//     return undefined
//   }
//   if (!filter && !offset && !first) {
//     return undefined
//   }
//   return existing && existing.slice(offset, offset + first)
// }

// const cacheMerge = (existing, incoming, props) => {
//   // Slicing is necessary because the existing data is
//   // immutable, and frozen in development.
//   // console.log('props: ', props)
//   const merged = existing ? existing.slice(0) : []
//   if (props.args) {
//     for (let i = 0; i < incoming.length; ++i) {
//       merged[props.args.offset + i] = incoming[i]
//     }
//   }
//   return merged
// }

// typePolicies: {
// Player: {
//   keyFields: ['playerId'],
// },
// Team: {
//   fields: {
//     players: {
//       merge: false,
//     },
//   },
// },
// Association: {
//   keyFields: ['associationId'],
// },
// Query: {
//   fields: {
//     Player: {
//       read: cacheRead,
//       keyArgs: ['playerId'],
//       merge: cacheMerge,
//     },
//     Team: {
//       read: cacheRead,
//       keyArgs: ['teamId'],
//       merge: cacheMerge,
//     },
//   },
// },
// },
