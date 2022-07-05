import React from 'react'
import HdrAutoIcon from '@mui/icons-material/HdrAuto'
import PowerIcon from '@mui/icons-material/Power'
import SportsHockeyIcon from '@mui/icons-material/SportsHockey'

type LevelsIconType = {
  [key: string]: {
    icon: React.ElementType
    name: string
    code: string
  }
}
export const levelsIcon: LevelsIconType = {
  professional: {
    icon: PowerIcon,
    name: 'Professional',
    code: 'professional',
  },
  intermediate: {
    icon: SportsHockeyIcon,
    name: 'Intermediate',
    code: 'intermediate',
  },
  amateur: {
    icon: HdrAutoIcon,
    name: 'Amateur',
    code: 'amateur',
  },
}
