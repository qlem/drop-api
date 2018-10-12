export default {
  author (parent, args, ctx) {
    return ctx.prisma.draft({id: parent.id}).author()
  }
}
