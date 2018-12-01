import { getUserId } from '../../utils'

export default {
  async createDrop (parent, { text }, ctx) {
    const userId = getUserId(ctx)
    return ctx.prisma.createDrop({
      text,
      author: {
        connect: { id: userId }
      }
    })
  },

  async updateDrop (parent, { id, text }, ctx) {
    const userId = getUserId(ctx)
    const dropExists = await ctx.prisma.$exists.drop({
      id,
      author: { id: userId }
    })
    if (!dropExists) {
      throw new Error('Drop not found or you\'re not the author')
    }
    return ctx.prisma.updateDrop({
      where: { id },
      data: {
        text
      }
    })
  },

  async deleteDrop (parent, { id }, ctx, ) {
    const userId = getUserId(ctx)
    const dropExists = await ctx.prisma.$exists.drop({
      id,
      author: { id: userId }
    })
    if (!dropExists) {
      throw new Error('Drop not found or you\'re not the author')
    }

    return ctx.prisma.deleteDrop({ id })
  }
}
