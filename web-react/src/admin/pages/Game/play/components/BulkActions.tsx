import { useFastSaveClick } from 'admin/pages/Game/play/components/FastEventsMenu'
import React from 'react'
import Img from 'react-cool-img'
import { Game, Team } from 'utils/types'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
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
  const [eventsCount, setEventsCount] = React.useState('')

  const resetState = () => {
    setEventType('')
    setEventsCount('')
  }

  const saveClick = useFastSaveClick({
    gameData,
    team,
    eventType,
    eventRelationType: 'savedBy', // will not use for saving, but need for ts
    eventsCount: parseInt(eventsCount),
  })
  return (
    <Box sx={{ height: '50%', overflow: 'auto', mb: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          width: '100%',
        }}
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
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value={'save'}>Save</MenuItem>
            <MenuItem value={'faceOff'}>FaceOff</MenuItem>
          </Select>
        </FormControl>
        <TextField
          variant="standard"
          id="events-count"
          label="Events Count"
          type="number"
          value={eventsCount}
          onChange={e => {
            setEventsCount(e.target.value)
          }}
        />
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={() => {
            saveClick()
            resetState()
          }}
          disabled={eventType === '' || eventsCount === ''}
        >
          <Typography variant="body1" component="div">
            Create Events
          </Typography>
        </Button>
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
