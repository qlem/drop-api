import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default {
  async signup (parent, args, ctx) {
    const password = await bcrypt.hash(args.password, 10)
    const user = await ctx.prisma.createUser({ ...args, password })

    return {
      token: jwt.sign({ userId: user.id }, process.env.API_SECRET),
      user
    }
  },

  async login (parent, { email, password }, ctx) {
    const user = await ctx.prisma.user({ email })
    if (!user) {
      throw new Error('Invalid email')
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }

    return {
      token: jwt.sign({ userId: user.id }, process.env.API_SECRET),
      user
    }
  }
}
