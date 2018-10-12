export default {
  drafts: {
    subscribe: async (parent, args, ctx) => {
      return ctx.prisma.$subscribe.draft({
        mutation_in: ['CREATED', 'UPDATED', 'DELETED']
      }).node()
    }
  }
}
