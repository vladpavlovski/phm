import React from 'react'
import { levelsIcon } from 'utils/constants/levelIcons'
import { gql, useQuery } from '@apollo/client'
import { Circle } from '@mui/icons-material'
import Chip from '@mui/material/Chip'

const GET_PLAYER_LEVELS = gql`
  query getPlayerLevels {
    systemSettings(where: { systemSettingsId: "system-settings" }) {
      rulePack {
        playerLevelTypes {
          playerLevelTypeId
          name
          icon
          code
        }
      }
    }
  }
`

type Props = {
  code: string
}

export const PlayerLevel = ({ code }: Props) => {
  const { loading, data } = useQuery(GET_PLAYER_LEVELS)
  const playerLevelTypes = data?.systemSettings?.[0]?.rulePack?.playerLevelTypes
  const playerLevel = playerLevelTypes?.find(
    (level: any) => level.code === code
  )

  const { icon: Icon = Circle } = levelsIcon?.[playerLevel?.icon] || {}

  if (loading) return null

  return code ? (
    <Chip icon={<Icon />} label={playerLevel.name} size="small" />
  ) : null
}
