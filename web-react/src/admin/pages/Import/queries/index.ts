import { gql } from '@apollo/client'

export const CREATE_PLAYER = gql`
  mutation createPlayer($input: [PlayerCreateInput!]!) {
    createPlayers(input: $input) {
      players {
        playerId
        firstName
        lastName
        externalId
        avatar
        activityStatus
        email
        phone
        gender
        levelCode
        birthday
        countryBirth
        cityBirth
        country
        city
        publicProfileUrl
        stick
        height
        weight
      }
    }
  }
`
