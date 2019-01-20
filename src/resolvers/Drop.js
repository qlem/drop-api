export default {
  author (parent, args, ctx) {
    return ctx.prisma.drop({id: parent.id}).author()
  },

  location (parent, args, ctx) {
    return ctx.prisma.drop({id: parent.id}).location()
  }
}
