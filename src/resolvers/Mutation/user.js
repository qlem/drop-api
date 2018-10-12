import { getUserId } from '../../utils'

export default {
  async updateUser (parent, { username }, ctx) {
    const userId = getUserId(ctx)
    return ctx.prisma.updateUser({
      where: { id: userId },
      data: {
        username
      }
    })
  }
}
