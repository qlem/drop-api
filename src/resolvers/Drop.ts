import { prismaObjectType } from 'nexus-prisma'

export const Drop = prismaObjectType({
  name: 'Drop',
  definition (t) {
    t.prismaFields(['*'])
    t.string('likeState', {
      nullable: true,
      resolve: async (parent, args, ctx) => {
        if (!ctx.user) {
          return null
        }
        const [ like ] = await ctx.prisma.likes({
          where: {
            drop: { id: parent.id },
            user: { id: ctx.user.id }
          }
        })
        if (like) {
          return 'LIKED'
        }
        const [ dislike ] = await ctx.prisma.dislikes({
          where: {
            drop: { id: parent.id },
            user: { id: ctx.user.id }
          }
        })
        if (dislike) {
          return 'DISLIKED'
        }
      }
    })
    t.int('likeCount', {
      resolve: async (parent, args, ctx) => {
        const liked = await ctx.prisma.likes({
          where: {
            drop: { id: parent.id }
          }
        })
        return liked.length
      }
    })
    t.int('dislikeCount', {
      resolve: async (parent, args, ctx) => {
        const disliked = await ctx.prisma.dislikes({
          where: {
            drop: { id: parent.id }
          }
        })
        return disliked.length
      }
    })
  }
})