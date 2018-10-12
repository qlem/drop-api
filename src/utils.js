import jwt from 'jsonwebtoken'
import { secret } from './constants'

export function getUserId(ctx) {
  const Authorization = ctx.request.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const { userId } = jwt.verify(token, secret)
    return userId
  }

  throw new AuthError()
}

export class AuthError extends Error {
  constructor() {
    super('Not authorized')
  }
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}