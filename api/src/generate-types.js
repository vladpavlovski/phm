import dotenv from 'dotenv'
import neo4j from 'neo4j-driver'
import * as path from 'path'
import { generate, OGM } from '@neo4j/graphql-ogm'
import { typeDefs } from './graphql-schema'

// set environment variables from .env
dotenv.config()

const {
  DEV_NEO4J_URI,
  DEV_NEO4J_USER,
  DEV_NEO4J_PASSWORD,
  PRODUCTION_NEO4J_URI,
  PRODUCTION_NEO4J_USER,
  PRODUCTION_NEO4J_PASSWORD,
  NETLIFY_DEV,
  GENERATE,
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

// Generic is applied on the OGM
const ogm = new OGM({ typeDefs, driver })

async function main() {
  // Only generate types when you make a schema change
  if (GENERATE) {
    const outFile = path.join(__dirname, '../../web-react/src/utils/types.ts')

    await generate({
      ogm,
      outFile,
    })

    console.log('Types Generated')

    process.exit(1)
  }
}
main()
