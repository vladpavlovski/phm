import { useFastSaveClick } from 'admin/pages/Game/play/components/FastEventsMenu'
import React from 'react'
import Img from 'react-cool-img'
import { Game, Team } from 'utils/types'
import { LoadingButton } from '@mui/lab'
import { Chip } from '@mui/material'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type Props = {
  gameData: Game
  teamHost: Team
  teamGuest: Team
}

const TeamBulkActions = ({
  team,
  gameData,
}: {
  gameData: Game
  team: Team
}) => {
  const [eventType, setEventType] = React.useState('')
  const [createdEventsCounter, setCreatedEventsCounter] = React.useState(0)
  const {
    saveClick,
    status: { createGameEventSimpleLoading },
  } = useFastSaveClick({
    gameData,
    team,
    eventType,
    eventRelationType: 'savedBy', // will not use for saving, but need for ts
  })
  return (
    <Box sx={{ height: '50%', overflow: 'auto', mb: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyItems="center"
        spacing={2}
        // sx={{
        //   width: '100%',
        // }}
      >
        <Img
          src={team?.logo}
          style={{
            width: '3rem',
            height: '3rem',
          }}
          alt={team?.name}
        />

        <Typography variant="h6">{team?.name ?? 'Team'}</Typography>
      </Stack>
      <Stack direction="row" spacing={2}>
        <FormControl variant="standard" sx={{ minWidth: 120 }}>
          <InputLabel id="event-type-id">Event Type</InputLabel>
          <Select
            labelId="event-type-id"
            id="event-type-select"
            value={eventType}
            label="Event Type"
            onChange={e => {
              setEventType(e.target.value)
              setCreatedEventsCounter(0)
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value={'save'}>Save</MenuItem>
            <MenuItem value={'faceOff'}>FaceOff</MenuItem>
          </Select>
        </FormControl>
        <LoadingButton
          size="small"
          loading={createGameEventSimpleLoading}
          type="button"
          variant="contained"
          color="primary"
          onClick={() => {
            setCreatedEventsCounter(state => state + 1)
            saveClick()
          }}
          disabled={createGameEventSimpleLoading || !eventType}
        >
          Create Event
        </LoadingButton>
        <Chip size="medium" label={createdEventsCounter} variant="outlined" />
      </Stack>
    </Box>
  )
}

export const BulkActions = ({ gameData, teamHost, teamGuest }: Props) => {
  return (
    <Paper sx={{ p: 2 }}>
      <TeamBulkActions team={teamHost} gameData={gameData} />
      <TeamBulkActions team={teamGuest} gameData={gameData} />
    </Paper>
  )
}
