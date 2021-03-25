export default {
  graphqlUri: process.env.REACT_APP_GRAPHQL_URI,
  auth0Domain: process.env.REACT_APP_AUTH0_DOMAIN,
  auth0ClientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
  auth0Audience: process.env.REACT_APP_AUTH0_AUDIENCE,
  auth0Scope: process.env.REACT_APP_AUTH0_SCOPE,
  bugfenderKey: process.env.REACT_APP_BUGFENDER_KEY,
  dev: process.env.NODE_ENV === 'development',
}
