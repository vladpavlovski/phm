// This module can be used to serve the GraphQL endpoint
// as a lambda function

const { ApolloServer } = require('apollo-server-lambda')
import { Neo4jGraphQL } from '@neo4j/graphql'
const neo4j = require('neo4j-driver')
// This module is copied during the build step
// Be sure to run `npm run build`
const { typeDefs } = require('./graphql-schema')
const { resolvers } = require('./resolvers')

const {
  DEV_NEO4J_URI,
  DEV_NEO4J_USER,
  DEV_NEO4J_PASSWORD,
  PRODUCTION_NEO4J_URI,
  PRODUCTION_NEO4J_USER,
  PRODUCTION_NEO4J_PASSWORD,
  NEO4J_DATABASE,
  NETLIFY_DEV,
  JWT_SECRET,
  AUTH_DIRECTIVES_ROLE_KEY,
} = process.env

const NEO4J_URI = NETLIFY_DEV ? DEV_NEO4J_URI : PRODUCTION_NEO4J_URI
const NEO4J_USER = NETLIFY_DEV ? DEV_NEO4J_USER : PRODUCTION_NEO4J_USER
const NEO4J_PASSWORD = NETLIFY_DEV
  ? DEV_NEO4J_PASSWORD
  : PRODUCTION_NEO4J_PASSWORD

const driver = neo4j.driver(
  NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(NEO4J_USER || 'neo4j', NEO4J_PASSWORD || 'neo4j')
)

const neoSchema = new Neo4jGraphQL({
  typeDefs,
  resolvers,
  driver,
  config: {
    jwt: {
      secret: JWT_SECRET.replace(/\\n/gm, '\n'),
      rolesPath: AUTH_DIRECTIVES_ROLE_KEY,
    },
  },
})

const server = new ApolloServer({
  schema: neoSchema.schema,
  context: { driver, neo4jDatabase: NEO4J_DATABASE },
})

exports.handler = server.createHandler()
