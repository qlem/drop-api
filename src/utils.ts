import * as jwt from 'jsonwebtoken'
import { Context } from './types'
import { AuthenticationError } from 'apollo-server'

interface Token {
  userId: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS = 6371000

export function getUserId (ctx: Context, withoutError: boolean = false): string {
  const Authorization = ctx.req.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    try {
      const { userId } = jwt.verify(token, process.env.API_SECRET) as Token
      return userId
    } catch (e) {
      if (withoutError) {
        return null
      }
      throw new AuthenticationError('Not authorized')
    }
  }
  if (withoutError) {
    return null
  }
  throw new AuthenticationError('Not authorized')
}

// for debug purpose
export function sleep (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function deg2rad (deg: number) {
  return deg * Math.PI / 180
}

function rad2deg (rad: number) {
  return rad * 180 / Math.PI
}

export function findDistance (point1: Location, point2: Location): number {
  const { latitude: lat1, longitude: lon1 } = point1
  const { latitude: lat2, longitude: lon2 } = point2
  const lat1rad = deg2rad(lat1)
  const lat2rad = deg2rad(lat2)
  const dphi = deg2rad(lat2 - lat1)
  const dlambda = deg2rad(lon2 - lon1)
  const a = Math.pow(Math.sin(dphi / 2), 2) + Math.cos(lat1rad) * Math.cos(lat2rad) * Math.pow(Math.sin(dlambda / 2), 2)
  return 2 * EARTH_RADIUS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
