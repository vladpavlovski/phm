interface Config {
  graphqlUri: string
  auth0Domain: string
  auth0ClientId: string
  auth0Audience: string
  auth0Scope: string
  bugfenderKey: string
  xGridKey: string
  qrGeneratorServer: string
  dev: boolean
}

const config: Config = {
  graphqlUri: process.env.REACT_APP_GRAPHQL_URI || '',
  auth0Domain: process.env.REACT_APP_AUTH0_DOMAIN || '',
  auth0ClientId: process.env.REACT_APP_AUTH0_CLIENT_ID || '',
  auth0Audience: process.env.REACT_APP_AUTH0_AUDIENCE || '',
  auth0Scope: process.env.REACT_APP_AUTH0_SCOPE || '',
  bugfenderKey: process.env.REACT_APP_BUGFENDER_KEY || '',
  xGridKey: process.env.REACT_APP_X_GRID_KEY || '',
  qrGeneratorServer: process.env.REACT_APP_QR_GENERATOR_SERVER || '',
  dev: process.env.NODE_ENV === 'development' || false,
}

export default config
