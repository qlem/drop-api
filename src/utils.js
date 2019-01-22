import jwt from 'jsonwebtoken'

const EARTH_RADIUS = 6371000

export function getUserId (ctx) {
  const Authorization = ctx.request.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const { userId } = jwt.verify(token, process.env.API_SECRET)
    return userId
  }
  throw new AuthError()
}

export class AuthError extends Error {
  constructor () {
    super('Not authorized')
  }
}

export function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function deg2rad (deg) {
  return deg * Math.PI / 180
}

function rad2deg (rad) {
  return rad * 180 / Math.PI
}

export function findDistance (point1, point2) {
  const { latitude: lat1, longitude: lon1 } = point1
  const { latitude: lat2, longitude: lon2 } = point2
  const lat1rad = deg2rad(lat1)
  const lat2rad = deg2rad(lat2)
  const dphi = deg2rad(lat2 - lat1)
  const dlambda = deg2rad(lon2 - lon1)
  const a = Math.pow(Math.sin(dphi / 2), 2) + Math.cos(lat1rad) * Math.cos(lat2rad) * Math.pow(Math.sin(dlambda / 2), 2)
  return 2 * EARTH_RADIUS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}