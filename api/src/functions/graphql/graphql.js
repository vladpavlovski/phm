// This module can be used to serve the GraphQL endpoint
// as a lambda function

const { ApolloServer } = require('apollo-server-lambda')
const { makeAugmentedSchema } = require('neo4j-graphql-js')
const neo4j = require('neo4j-driver')

const {
  DEV_NEO4J_URI,
  DEV_NEO4J_USER,
  DEV_NEO4J_PASSWORD,
  PRODUCTION_NEO4J_URI,
  PRODUCTION_NEO4J_USER,
  PRODUCTION_NEO4J_PASSWORD,
  NEO4J_ENCRYPTED,
  NEO4J_DATABASE,
  NETLIFY_DEV,
} = process.env

const NEO4J_URI = NETLIFY_DEV ? DEV_NEO4J_URI : PRODUCTION_NEO4J_URI
const NEO4J_USER = NETLIFY_DEV ? DEV_NEO4J_USER : PRODUCTION_NEO4J_USER
const NEO4J_PASSWORD = NETLIFY_DEV
  ? DEV_NEO4J_PASSWORD
  : PRODUCTION_NEO4J_PASSWORD

// This module is copied during the build step
// Be sure to run `npm run build`
const { typeDefs } = require('./graphql-schema')
const { resolvers } = require('./resolvers')

const driver = neo4j.driver(
  NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(NEO4J_USER || 'neo4j', NEO4J_PASSWORD || 'neo4j'),
  {
    encrypted: NEO4J_ENCRYPTED ? 'ENCRYPTION_ON' : 'ENCRYPTION_OFF',
  }
)

const server = new ApolloServer({
  schema: makeAugmentedSchema({
    typeDefs,
    resolvers,
    config: {
      query: {
        exclude: ['S3Payload'],
      },
      mutation: {
        exclude: ['S3Payload'],
      },
      auth: {
        isAuthenticated: true,
        hasRole: true,
        // hasScope: true,
      },
    },
  }),
  context: ({ req }) => {
    return {
      driver,
      req,
      neo4jDatabase: NEO4J_DATABASE,
      cypherParams: {
        userAuthId: req?.user?.sub,
      },
    }
  },
})

exports.handler = server.createHandler()
