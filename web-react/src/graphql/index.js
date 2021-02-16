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

const cache = new InMemoryCache({
  // typePolicies: {
  //   Player: {
  //     keyFields: ['playerId'],
  //   },
  //   Team: {
  //     keyFields: ['teamId'],
  //     read: cacheRead,
  //     merge: cacheMerge,
  //   },
  //   Association: {
  //     keyFields: ['associationId'],
  //   },
  //   // Query: {
  //   //   fields: {
  //   //     Player: {
  //   //       read: cacheRead,
  //   //       keyArgs: ['playerId'],
  //   //       merge: cacheMerge,
  //   //     },
  //   //     Team: {
  //   //       read: cacheRead,
  //   //       keyArgs: ['teamId'],
  //   //       merge: cacheMerge,
  //   //     },
  //   //   },
  //   // },
  // },
})

const client = new ApolloClient({
  link: concat(errorLink, httpLink),
  cache,
})

export { client }
