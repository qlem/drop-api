import { prismaObjectType } from 'nexus-prisma'
import { arg, idArg, stringArg } from 'nexus'
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
        const user = await ctx.prisma.createUser({
          ...args,
          password,
          roles: {
            set: 'USER'
          }
        })
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
    t.field('loginBack', {
      type: 'AuthPayload',
      args: {
        email: stringArg(),
        password: stringArg()
      },
      description: 'ADMIN role required',
      resolve: async (parent, { email, password }, ctx) => {
        const user = await ctx.prisma.user({ email })
        if (!user) {
          throw new AuthenticationError('Invalid email')
        }
        if (!user.roles.includes('ADMIN')) {
          throw new AuthenticationError('You are not an admin')
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
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
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
            connect: { id: ctx.user.id }
          }
        })
      }
    })
    t.field('updateDrop', {
      ...t.prismaType.updateDrop,
      args: {
        id: idArg(),
        text: stringArg(),
        location: arg({ type: 'LocationUpdateDataInput' }),
        color: stringArg()
      },
      resolve: async (parent, {id, text, location: {latitude, longitude, altitude}, color}, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        if (!ctx.user.roles.includes('ADMIN')) {
          const dropExists = await ctx.prisma.$exists.drop({
            id,
            author: { id: ctx.user.id }
          })
          if (!dropExists) {
            throw new ApolloError('Drop not found or you\'re not the author', 'BAD REQUEST')
          }
        }
        return ctx.prisma.updateDrop({
          where: {id},
          data: {
            text,
            color,
            location: {
              update: {
                latitude,
                longitude,
                altitude
              }
            }
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
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        if (!ctx.user.roles.includes('ADMIN')) {
          const dropExists = await ctx.prisma.$exists.drop({
            id,
            author: {id: ctx.user.id}
          })
          if (!dropExists) {
            throw new ApolloError('Drop not found or you\'re not the author', 'BAD REQUEST')
          }
        }
        return ctx.prisma.deleteDrop({id})
      }
    })
    t.field('updateUsername', {
      ...t.prismaType.updateUser,
      description: 'Update its own username',
      args: {
        username: stringArg()
      },
      resolve: async (parent, { username }, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        return ctx.prisma.updateUser({
          where: { id: ctx.user.id },
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
      description: 'Like a Drop (provide its ID). When the drop is already liked, the like is removed.',
      resolve: async (parent, { id }, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        const userId = ctx.user.id
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
        } else {
          await ctx.prisma.createLike({
            drop: {
              connect: { id }
            },
            user: {
              connect: { id: userId }
            }
          })
          await ctx.prisma.deleteManyDislikes({
            drop: { id },
            user: { id: userId }
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
      description: 'Dislike a Drop (provide its ID). When the drop is already disliked, the dislike is removed.',
      resolve: async (parent, { id }, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        const userId = ctx.user.id
        const dropExists = await ctx.prisma.$exists.drop({ id })
        if (!dropExists) {
          throw new ApolloError('Drop not found', 'BAD REQUEST')
        }
        const [ dislike ] = await ctx.prisma.dislikes({
          where: {
            drop: { id },
            user: { id: userId }
          }
        })
        if (dislike) {
          await ctx.prisma.deleteDislike({
            id: dislike.id
          })
        } else {
          await ctx.prisma.createDislike({
            drop: {
              connect: { id }
            },
            user: {
              connect: { id: userId }
            }
          })
          await ctx.prisma.deleteManyLikes({
            drop: { id },
            user: { id: userId }
          })
        }
        return ctx.prisma.drop({ id })
      }
    })
    t.field('deleteUser', {
      ...t.prismaType.deleteUser,
      description: 'ADMIN role required',
      args: {
        id: idArg()
      },
      resolve (parent, { id }, ctx) {
        if (!ctx.user || !ctx.user.roles.includes('ADMIN')) {
          throw new AuthenticationError('Not authorized')
        }
        return ctx.prisma.deleteUser({ id })
      }
    })
    t.field('deleteMe', {
      ...t.prismaType.deleteUser,
      description: 'Delete its own user',
      args: {},
      resolve (parent, args, ctx) {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        return ctx.prisma.deleteUser({ id: ctx.user.id })
      }
    })
    t.field('setRole', {
      ...t.prismaType.updateUser,
      description: 'ADMIN role required',
      args: {
        userId: idArg(),
        roles: arg({ type: 'Role', list: true })
      },
      resolve: async (parent, { userId, roles }, ctx) => {
        if (!ctx.user || !ctx.user.roles.includes('ADMIN')) {
          throw new AuthenticationError('Not authorized')
        }
        return ctx.prisma.updateUser({
          where: { id: userId },
          data: {
            roles: { set: roles }
          }
        })
      }
    })
  }
})
