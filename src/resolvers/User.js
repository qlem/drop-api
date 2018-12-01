export default {
  drops (parent, args, context) {
    return context.prisma.user({
      id: parent.id
    }).drops()
  }
}
