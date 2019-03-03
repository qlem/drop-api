import * as dotenv from 'dotenv'
import { Prisma } from './generated/prisma-client'
import datamodelInfo from './generated/nexus-prisma'
import { makePrismaSchema } from 'nexus-prisma'
import * as path from 'path'
import * as allTypes from './resolvers'
import { ApolloServer } from 'apollo-server'

export const PORT = 4000

dotenv.config()

const prisma = new Prisma({
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET
})

const schema = makePrismaSchema({
  // Provide all the GraphQL types we've implemented
  types: [ allTypes ],

  // Configure the interface to Prisma
  prisma: {
    datamodelInfo,
    client: prisma
  },

  // Specify where Nexus should put the generated files
  outputs: {
    schema: path.join(__dirname, './generated/schema.graphql'),
    typegen: path.join(__dirname, './generated/nexus.ts')
  },

  // Configure nullability of input arguments: All arguments are non-nullable by default
  nonNullDefaults: {
    input: true,
    output: true
  },

  // Configure automatic type resolution for the TS representations of the associated types
  typegenAutoConfig: {
    sources: [
      {
        source: path.join(__dirname, './types.ts'),
        alias: 'types'
      }
    ],
    contextType: 'types.Context'
  },

  shouldGenerateArtifacts: Boolean(
    !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  )
})

const server = new ApolloServer({
  schema,
  context: req => ({ ...req, prisma }),
  introspection: true,
  playground: {
    settings: {
      'editor.theme': 'dark',
      'editor.fontFamily': 'Inconsolata',
      'editor.reuseHeaders': true
    }
  },
  formatError: error => {
    console.log(error)
    return error
  }
})

server.listen(PORT).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
