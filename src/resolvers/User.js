export default {
  drafts (parent, args, context) {
    return context.prisma.user({
      id: parent.id
    }).drafts()
  }
}
