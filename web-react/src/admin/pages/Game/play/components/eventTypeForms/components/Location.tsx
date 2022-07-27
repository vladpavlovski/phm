import hockeyField from 'img/hockey-field.webp'
import hockeyGates from 'img/hockey-gates.webp'
import React from 'react'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

export type LocationType = {
  name: string
  value: string
  row: number
}

export const locations: LocationType[] = [
  {
    name: 'Left corner',
    value: 'leftCorner',
    row: 1,
  },
  {
    name: 'Behind net',
    value: 'behindNet',
    row: 1,
  },
  {
    name: 'Right corner',
    value: 'rightCorner',
    row: 1,
  },
  {
    name: 'Left circle',
    value: 'leftCircle',
    row: 2,
  },
  {
    name: 'Between the circles',
    value: 'betweenCircles',
    row: 2,
  },
  {
    name: 'Right circle',
    value: 'rightCircle',
    row: 2,
  },
  {
    name: 'Left blue line',
    value: 'leftBlueLine',
    row: 3,
  },
  {
    name: 'Center blue line',
    value: 'centerBlueLine',
    row: 3,
  },
  {
    name: 'Right blue line',
    value: 'rightBlueLine',
    row: 3,
  },
  {
    name: 'Left central zone',
    value: 'leftCentralZone',
    row: 4,
  },
  {
    name: 'Center central zone',
    value: 'centerCentralZone',
    row: 4,
  },
  {
    name: 'Right central zone',
    value: 'rightCentralZone',
    row: 4,
  },
  {
    name: 'Left defensive zone',
    value: 'leftDefensiveZone',
    row: 5,
  },
  {
    name: 'Center defensive zone',
    value: 'centerDefensiveZone',
    row: 5,
  },
  {
    name: 'Right defensive zone',
    value: 'rightDefensiveZone',
    row: 5,
  },
]

export type GoalLocationType = {
  name: string
  value: string
  row: number
}

export const goalLocations: GoalLocationType[] = [
  {
    name: 'Left top corner',
    value: 'leftTopCorner',
    row: 1,
  },
  {
    name: 'Top shelf',
    value: 'topShelf',
    row: 1,
  },
  {
    name: 'Right top corner',
    value: 'rightTopCorner',
    row: 1,
  },
  {
    name: 'Left side',
    value: 'leftSide',
    row: 2,
  },
  {
    name: 'Middle',
    value: 'middle',
    row: 2,
  },
  {
    name: 'Right side',
    value: 'rightSide',
    row: 2,
  },
  {
    name: 'Left bottom corner',
    value: 'leftBottomCorner',
    row: 3,
  },
  {
    name: 'Five hole',
    value: 'fiveHole',
    row: 3,
  },
  {
    name: 'Right bottom corner',
    value: 'rightBottomCorner',
    row: 3,
  },
]

type ELProps = {
  selected?: LocationType
  onClick: (p: LocationType) => void
}

export const EventLocation = ({ selected, onClick }: ELProps) => {
  return (
    <div
      style={{
        width: 450,
        height: '600px',
        backgroundImage: `url(${hockeyField})`,
        backgroundPosition: 'top',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Grid container rowSpacing={4} columnSpacing={1}>
        {locations.map(location => (
          <Grid item xs={4} key={location.value}>
            <Button
              variant={
                selected?.value === location?.value ? 'outlined' : 'contained'
              }
              color="primary"
              sx={{
                width: '100%',
                height: '80px',
                backgroundColor:
                  selected?.value === location?.value
                    ? 'rgba(255,255,255, 0.8)'
                    : 'rgba(33,150,243, 0.8)',
              }}
              onClick={() => {
                onClick(location)
              }}
            >
              {location.name}
            </Button>
          </Grid>
        ))}
      </Grid>
    </div>
  )
}

type GLProps = {
  selected?: GoalLocationType
  onClick: (p: GoalLocationType) => void
}

export const GoalLocation = ({ selected, onClick }: GLProps) => {
  return (
    <div
      style={{
        width: 600,
        height: 385,
        backgroundImage: `url(${hockeyGates})`,
        backgroundPosition: 'top',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{
          p: 5.5,
        }}
      >
        {goalLocations.map(location => (
          <Grid item xs={4} key={location.value}>
            <Button
              variant={
                selected?.value === location?.value ? 'outlined' : 'contained'
              }
              color="primary"
              sx={{
                width: '100%',
                height: 100,
                backgroundColor:
                  selected?.value === location?.value
                    ? 'rgba(255,255,255, 0.8)'
                    : 'rgba(33,150,243, 0.8)',
              }}
              onClick={() => {
                onClick(location)
              }}
            >
              {location.name}
            </Button>
          </Grid>
        ))}
      </Grid>
    </div>
  )
}
