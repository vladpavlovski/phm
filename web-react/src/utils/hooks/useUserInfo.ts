import config from 'config'
import { useAuth0, User } from '@auth0/auth0-react'

const audience = config.auth0Audience

const hasRole = (role: string, user?: User) =>
  user?.[`${audience}/roles`]?.includes(role) || false

const useUserInfo = (): {
  user?: User
  isAdmin: boolean
  isEditor: boolean
  isUser: boolean
  canEdit: boolean
} => {
  const { user } = useAuth0()

  return {
    user,
    isAdmin: hasRole('admin', user),
    isEditor: hasRole('editor', user),
    isUser: hasRole('user', user),
    canEdit: hasRole('admin', user) || hasRole('editor', user),
  }
}

export { useUserInfo }
