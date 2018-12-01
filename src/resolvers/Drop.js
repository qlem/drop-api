export default {
  author (parent, args, ctx) {
    return ctx.prisma.drop({id: parent.id}).author()
  }
}
