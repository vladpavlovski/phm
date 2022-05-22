import React from 'react'
import { GiInterleavedClaws, GiSupersonicBullet, GiWinterHat } from 'react-icons/gi'

type LevelsIconType = {
  [key: string]: {
    icon: React.ElementType
    name: string
    code: string
  }
}
export const levelsIcon: LevelsIconType = {
  professional: {
    icon: GiSupersonicBullet,
    name: 'Professional',
    code: 'professional',
  },
  intermediate: {
    icon: GiInterleavedClaws,
    name: 'Intermediate',
    code: 'intermediate',
  },
  amateur: {
    icon: GiWinterHat,
    name: 'Amateur',
    code: 'amateur',
  },
}
