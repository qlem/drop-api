import '@babel/polyfill'
import dotenv from 'dotenv'
import { GraphQLServer } from 'graphql-yoga'
import { Prisma } from './generated/prisma-client'
import Query from './resolvers/Query'
import auth from './resolvers/Mutation/auth'
import draft from './resolvers/Mutation/draft'
import Draft from './resolvers/Draft'
import User from './resolvers/User'
import user from './resolvers/Mutation/user'

dotenv.config()

const prisma = new Prisma({
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET
})

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers: {
    Query,
    Draft,
    User,
    Mutation: {
      ...auth,
      ...draft,
      ...user
    }
  },
  context: req => ({...req, prisma})
})

server.start(() => console.log('Server is running on http://localhost:4000'))
