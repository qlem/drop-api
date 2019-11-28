import { prismaObjectType } from 'nexus-prisma'
import { floatArg } from 'nexus'
import { findDistance } from '../utils'
import { AuthenticationError } from 'apollo-server'

interface Token {
  userId: string;
}

export const Query = prismaObjectType({
  name: 'Query',
  definition: t => {
    t.prismaFields([
      { name: 'drops', alias: 'dropped' },
      'drop'
    ])
    t.field('droppedAround', {
      type: 'Drop',
      list: true,
      args: {
        latitude: floatArg(),
        longitude: floatArg(),
        radius: floatArg()
      },
      resolve: async (parent, { latitude, longitude, radius }, ctx) => {
        const dropped = await ctx.prisma.drops()
        const closeDrops = []
        for (let drop of dropped) {
          const location = await ctx.prisma.drop({ id: drop.id }).location()
          const distance = findDistance({ latitude, longitude }, { latitude: location.latitude, longitude: location.longitude })
          if (distance <= radius) {
            closeDrops.push(drop)
          }
        }
        return closeDrops
      }
    })
    t.field('amIAuth', {
      type: 'AuthCheck',
      resolve: async (parent, args, { user }) => {
        if (!user) {
          return { isAuth: false }
        }
        return { isAuth: true, me: user }
      }
    })
    t.field('amIAdmin', {
      type: 'Boolean',
      resolve: async (parent, args, { user }) => {
        if (!user) {
          return false
        }
        return user.roles.includes('ADMIN')
      }
    })
    t.field('users', {
      ...t.prismaType.users,
      description: 'ADMIN role required',
      resolve (parent, args, ctx) {
        if (!ctx.user || !ctx.user.roles.includes('ADMIN')) {
          throw new AuthenticationError('Not authorized')
        }
        return ctx.prisma.users()
      }
    })
    t.field('profile', {
      type: 'Profile',
      resolve: async (parent, args, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authenticated')
        }
        const drops = await ctx.prisma.drops({ where: {
          author: { id : ctx.user.id }
        }})
        let likes = 0
        let dislikes = 0
        for (const drop of drops) {
          const allLikes = await ctx.prisma.likes({ where: { drop: { id: drop.id } } })
          const allDislikes = await ctx.prisma.dislikes({ where: { drop: { id: drop.id } } })
          likes += allLikes.length
          dislikes += allDislikes.length
        }
        return {
          me: ctx.user,
          drops: drops.length,
          likes,
          reports: dislikes
        }
      }
    })
  }
})
