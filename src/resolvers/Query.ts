import * as jwt from 'jsonwebtoken'
import { prismaObjectType } from 'nexus-prisma'
import { floatArg } from 'nexus'
import { findDistance } from '../utils'

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
          if (distance <= radius) closeDrops.push(drop)
        }
        return closeDrops
      }
    })
    t.field('amIAuth', {
      type: 'AuthCheck',
      resolve: async (parent, args, ctx) => {
        const Authorization = ctx.req.headers.authorization
        if (Authorization) {
          const token = Authorization.replace('Bearer ', '')
          try {
            const { userId } = jwt.verify(token, process.env.API_SECRET) as Token
            const me = await ctx.prisma.user({ id: userId })
            if (!me) {
              return { isAuth: false }
            }
            return { isAuth: true, me }
          } catch (e) {
            return { isAuth: false }
          }
        }
        return { isAuth: false }
      }
    })
  }
})

