import jwt from 'jsonwebtoken'

export default {
  dropped (parent, args, ctx) {
    return ctx.prisma.drops({
      orderBy: args.orderBy,
      skip: args.skip,
      first: args.first,
      last: args.last })
  },

  drop (parent, { id }, ctx) {
    return ctx.prisma.drop({ id })
  },

  users (parent, args, ctx) {
    return ctx.prisma.users({
      orderBy: args.orderBy
    })
  },

  user (parent, { id }, ctx) {
    return ctx.prisma.user({ id })
  },

  amIAuth (parent, args, ctx,) {
    const Authorization = ctx.request.get('Authorization')
    if (Authorization) {
      try {
        const token = Authorization.replace('Bearer ', '')
        const { userId } = jwt.verify(token, process.env.API_SECRET)
        const me = ctx.prisma.user({ id: userId })
        return { isAuth: true, me }
      } catch (e) {
        return { isAuth: false }
      }
    }
    return { isAuth: false }
  }
}
