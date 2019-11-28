import { objectType } from 'nexus'

export const Profile = objectType({
  name: 'Profile',
  definition (t) {
    t.field('me', { type: 'User', nullable: false })
    t.int('drops', { nullable: true })
    t.int('likes', { nullable: true })
    t.int('reports', { nullable: true })
  }
})
