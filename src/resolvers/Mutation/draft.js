import { getUserId } from '../../utils'

export default {
  async drop (parent, { text }, ctx) {
    const userId = getUserId(ctx)
    return ctx.prisma.createDraft({
      text,
      author: {
        connect: { id: userId }
      }
    })
  },

  async updateDraft (parent, { id, text }, ctx) {
    const userId = getUserId(ctx)
    const postExists = await ctx.prisma.$exists.draft({
      id,
      author: { id: userId }
    })
    if (!postExists) {
      throw new Error('Draft not found or you\'re not the author')
    }
    return ctx.prisma.updateDraft({
      where: { id },
      data: {
        text
      }
    })
  },

  async deleteDraft (parent, { id }, ctx, ) {
    const userId = getUserId(ctx)
    const postExists = await ctx.prisma.$exists.draft({
      id,
      author: { id: userId }
    })
    if (!postExists) {
      throw new Error('Draft not found or you\'re not the author')
    }

    return ctx.prisma.deleteDraft({ id })
  }
}
