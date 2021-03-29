import { useMemo } from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import config from '../../config'

const GET_USER = gql`
  query getUser($userId: ID) {
    user: User(userId: $userId) {
      userId
      firstName
      lastName
    }
  }
`

const CREATE_USER = gql`
  mutation createUser(
    $userId: ID!
    $firstName: String!
    $lastName: String!
    $nickName: String
    $email: String
    $emailVerified: Boolean
    $locale: String
    $avatar: String
  ) {
    createUser: CreateUser(
      userId: $userId
      firstName: $firstName
      lastName: $lastName
      nickName: $nickName
      email: $email
      emailVerified: $emailVerified
      locale: $locale
      avatar: $avatar
    ) {
      userId
    }
  }
`

export const useUserSetup = ({ user, isAuthenticated }) => {
  const auth0Audience = useMemo(() => config.auth0Audience, [])

  const [createUser] = useMutation(CREATE_USER, {
    variables: {
      userId: user?.sub,
      firstName: user?.given_name,
      lastName: user?.family_name,
      nickName: user?.nickName,
      email: user?.email,
      emailVerified: user?.email_verified,
      locale: user?.locale,
      avatar: user?.picture,
    },
  })

  useQuery(GET_USER, {
    fetchPolicy: 'network-only',
    variables: {
      userId: user?.sub,
    },
    skip:
      (!isAuthenticated && !user) ||
      user?.[`${auth0Audience}/user_metadata`].loginsCount > 1,
    onCompleted: data => {
      if (data?.user?.length === 0) {
        // No user find. Create new one.
        createUser()
      }
    },
  })
}
