import { prismaObjectType } from 'nexus-prisma'
import { getUserId } from "../utils"

export const Drop = prismaObjectType({
  name: 'Drop',
  definition (t) {
    t.prismaFields(['*'])
    t.string('likeState', {
      nullable: true,
      resolve: async (parent, args, ctx) => {
        const userId = getUserId(ctx, true)
        if (!userId) {
          return null
        }
        const [ like ] = await ctx.prisma.likes({
          where: {
            drop: { id: parent.id },
            user: { id: userId }
          }
        })
        if (like) {
          return like.state
        }
      }
    })
    t.int('likeCount', {
      resolve: async (parent, args, ctx) => {
        const liked = await ctx.prisma.likes({
          where: {
            drop: { id: parent.id },
            state: 'LIKED'
          }
        })
        return liked.length
      }
    })
    t.int('dislikeCount', {
      resolve: async (parent, args, ctx) => {
        const disliked = await ctx.prisma.likes({
          where: {
            drop: { id: parent.id },
            state: 'DISLIKED'
          }
        })
        return disliked.length
      }
    })
  }
})