import { prismaObjectType } from 'nexus-prisma'
import { arg, idArg, stringArg } from 'nexus'
import { getUserId } from '../utils'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import { ApolloError, AuthenticationError } from 'apollo-server'

export const Mutation = prismaObjectType({
  name: 'Mutation',
  definition (t) {
    t.field('signup', {
      type: 'AuthPayload',
      args: {
        email: stringArg(),
        password: stringArg(),
        username: stringArg()
      },
      resolve: async (parent, args, ctx) => {
        const password = await bcrypt.hash(args.password, 10)
        const user = await ctx.prisma.createUser({...args, password})
        return {
          token: jwt.sign({userId: user.id}, process.env.API_SECRET),
          user
        }
      }
    })
    t.field('login', {
      type: 'AuthPayload',
      args: {
        email: stringArg(),
        password: stringArg()
      },
      resolve: async (parent, {email, password}, ctx) => {
        const user = await ctx.prisma.user({email})
        if (!user) {
          throw new AuthenticationError('Invalid email')
        }
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
          throw new AuthenticationError('Invalid password')
        }
        return {
          token: jwt.sign({userId: user.id}, process.env.API_SECRET),
          user
        }
      }
    })
    t.field('createDrop', {
      ...t.prismaType.createDrop,
      args: {
        text: stringArg(),
        location: arg({ type: 'LocationCreateInput' }),
        color: stringArg()
      },
      resolve: async (parent, {text, location: {latitude, longitude, altitude}, color}, ctx) => {
        const userId = getUserId(ctx)
        return ctx.prisma.createDrop({
          text,
          color,
          location: {
            create: {
              latitude,
              longitude,
              altitude
            }
          },
          author: {
            connect: {id: userId}
          }
        })
      }
    })
    t.field('updateDrop', {
      ...t.prismaType.updateDrop,
      args: {
        id: idArg(),
        text: stringArg(),
        color: stringArg()
      },
      resolve: async (parent, {id, text, color}, ctx) => {
        const userId = getUserId(ctx)
        const dropExists = await ctx.prisma.$exists.drop({
          id,
          author: {id: userId}
        })
        if (!dropExists) {
          throw new ApolloError('Drop not found or you\'re not the author', 'BAD REQUEST')
        }
        return ctx.prisma.updateDrop({
          where: {id},
          data: {
            text,
            color
          }
        })
      }
    })
    t.field('deleteDrop', {
      ...t.prismaType.deleteDrop,
      args: {
        id: idArg()
      },
      resolve: async (parent, { id }, ctx) => {
        const userId = getUserId(ctx)
        const dropExists = await ctx.prisma.$exists.drop({
          id,
          author: {id: userId}
        })
        if (!dropExists) {
          throw new ApolloError('Drop not found or you\'re not the author', 'BAD REQUEST')
        }

        return ctx.prisma.deleteDrop({id})
      }
    })
    t.field('updateUser', {
      ...t.prismaType.updateUser,
      args: {
        username: stringArg()
      },
      resolve: async (parent, { username }, ctx) => {
        const userId = getUserId(ctx)
        return ctx.prisma.updateUser({
          where: { id: userId },
          data: {
            username
          }
        })
      }
    })
    t.field('like', {
      type: 'Drop',
      args: {
        id: idArg()
      },
      resolve: async (parent, { id }, ctx) => {
        const userId = getUserId(ctx)
        const dropExists = await ctx.prisma.$exists.drop({ id })
        if (!dropExists) {
          throw new ApolloError('Drop not found', 'BAD REQUEST')
        }
        const [ like ] = await ctx.prisma.likes({
          where: {
            drop: { id },
            user: { id: userId }
          }
        })
        if (like) {
          await ctx.prisma.updateLike({
            where: { id: like.id },
            data: { state: 'LIKED' }
          })
        } else {
          await ctx.prisma.createLike({
            state: 'LIKED',
            drop: {
              connect: { id }
            },
            user: {
              connect: { id: userId }
            }
          })
        }
        return ctx.prisma.drop({ id })
      }
    })
    t.field('dislike', {
      type: 'Drop',
      args: {
        id: idArg()
      },
      resolve: async (parent, { id }, ctx) => {
        const userId = getUserId(ctx)
        const dropExists = await ctx.prisma.$exists.drop({ id })
        if (!dropExists) {
          throw new ApolloError('Drop not found', 'BAD REQUEST')
        }
        const [ like ] = await ctx.prisma.likes({
          where: {
            drop: { id },
            user: { id: userId }
          }
        })
        if (like) {
          await ctx.prisma.updateLike({
            where: { id: like.id },
            data: { state: 'DISLIKED' }
          })
        } else {
          await ctx.prisma.createLike({
            state: 'DISLIKED',
            drop: {
              connect: { id }
            },
            user: {
              connect: { id: userId }
            }
          })
        }
        return ctx.prisma.drop({ id })
      }
    })
    t.field('undoLike', {
      type: 'Drop',
      args: {
        id: idArg()
      },
      resolve: async (parent, { id }, ctx) => {
        const userId = getUserId(ctx)
        const dropExists = await ctx.prisma.$exists.drop({ id })
        if (!dropExists) {
          throw new ApolloError('Drop not found', 'BAD REQUEST')
        }
        const [ like ] = await ctx.prisma.likes({
          where: {
            drop: { id },
            user: { id: userId }
          }
        })
        if (like) {
          await ctx.prisma.deleteLike({
            id: like.id
          })
        }
        return ctx.prisma.drop({ id })
      }
    })
  }
})
