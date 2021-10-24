import { typeDefs } from './graphql-schema'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import neo4j from 'neo4j-driver'
import { Neo4jGraphQL } from '@neo4j/graphql'
import dotenv from 'dotenv'
import { initializeDatabase } from './initialize'
// import jwt from 'express-jwt'
import { resolvers } from './resolvers'
// set environment variables from .env
dotenv.config()

const {
  JWT_SECRET,
  DEV_NEO4J_URI,
  DEV_NEO4J_USER,
  DEV_NEO4J_PASSWORD,
  PRODUCTION_NEO4J_URI,
  PRODUCTION_NEO4J_USER,
  PRODUCTION_NEO4J_PASSWORD,
  NEO4J_DATABASE,
  GRAPHQL_SERVER_PORT,
  GRAPHQL_SERVER_PATH,
  GRAPHQL_SERVER_HOST,
  NETLIFY_DEV,
  AUTH_DIRECTIVES_ROLE_KEY,
} = process.env

const NEO4J_URI = NETLIFY_DEV ? DEV_NEO4J_URI : PRODUCTION_NEO4J_URI
const NEO4J_USER = NETLIFY_DEV ? DEV_NEO4J_USER : PRODUCTION_NEO4J_USER
const NEO4J_PASSWORD = NETLIFY_DEV
  ? DEV_NEO4J_PASSWORD
  : PRODUCTION_NEO4J_PASSWORD

const app = express()

// app.use(
//   jwt({
//     secret: JWT_SECRET.replace(/\\n/gm, '\n'),
//     algorithms: ['RS256'],
//     credentialsRequired: false,
//   })
// )

const driver = neo4j.driver(
  NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(NEO4J_USER || 'neo4j', NEO4J_PASSWORD || 'neo4j')
)

const neo4jGraphQL = new Neo4jGraphQL({
  driver,
  typeDefs,
  resolvers,
  config: {
    jwt: {
      secret: JWT_SECRET.replace(/\\n/gm, '\n'),
      rolesPath: AUTH_DIRECTIVES_ROLE_KEY,
    },
  },
})

const init = async driver => {
  await initializeDatabase(driver)
}

init(driver)

const server = new ApolloServer({
  context: ({ req }) => {
    return {
      driver,
      req,
      neo4jDatabase: NEO4J_DATABASE,
      cypherParams: {
        user: req?.user,
        userAuthId: req?.user?.sub,
      },
    }
  },
  schema: neo4jGraphQL.schema,
  introspection: NETLIFY_DEV || false,
  playground: NETLIFY_DEV || false,
})

// Specify host, port and path for GraphQL endpoint
const port = GRAPHQL_SERVER_PORT || 4001
const path = GRAPHQL_SERVER_PATH || '/graphql'
const host = GRAPHQL_SERVER_HOST || '0.0.0.0'

server.applyMiddleware({ app, path })

app.listen({ host, port, path }, () => {
  console.log(`GraphQL server ready at http://${host}:${port}${path}`)
})
