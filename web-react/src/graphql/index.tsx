import React from 'react'
import { Bugfender } from '@bugfender/sdk'
import {
  ApolloProvider,
  ApolloClient,
  HttpLink,
  InMemoryCache,
  from,
  NormalizedCacheObject,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { useAuth0 } from '@auth0/auth0-react'
import { onError } from '@apollo/client/link/error'
// import { CachePersistor, LocalStorageWrapper } from 'apollo3-cache-persist'
import config from '../config'

type Props = {
  children: any
}

const AuthorizedApolloProvider = ({ children }: Props) => {
  const [client, setClient] =
    React.useState<ApolloClient<NormalizedCacheObject>>()
  // const [persistor, setPersistor] = React.useState<CachePersistor<NormalizedCacheObject>()

  const { getAccessTokenSilently } = useAuth0()

  React.useEffect(() => {
    async function init() {
      const cache = new InMemoryCache()
      const httpLink = new HttpLink({
        uri: config.graphqlUri || '/graphql',
      })

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
            !config.dev &&
              Bugfender.sendIssue('[Network error]', `${networkError}`)
          }
          forward(operation)
        }
      )
      const authLink = setContext(async (_, { headers, ...context }) => {
        let token
        try {
          token = await getAccessTokenSilently()
        } catch (error) {
          console.error(error)
        }
        return {
          headers: {
            ...headers,
            ...(token && { authorization: token ? `Bearer ${token}` : '' }),
          },
          ...context,
        }
      })

      // let newPersistor = new CachePersistor({
      //   cache,
      //   storage: new LocalStorageWrapper(window.localStorage),
      //   debug: true,
      //   trigger: 'write',
      // })
      // await newPersistor.restore()

      // setPersistor(newPersistor)

      const apolloClient = new ApolloClient<NormalizedCacheObject>({
        link: from([errorLink, authLink, httpLink]),
        cache,
        connectToDevTools: config.dev,
      })
      setClient(apolloClient)
    }

    init().catch(console.error)
  }, [])

  if (!client) {
    return <h2>Initializing app...</h2>
  }

  return (
    <ApolloProvider client={client}>
      {children({ persistor: null })}
    </ApolloProvider>
  )
}

export { AuthorizedApolloProvider }
