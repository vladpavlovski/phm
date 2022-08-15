import { Error, Loader, QuickSearchToolbar, Title } from 'components'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { setIdFromEntityId, sortByStatus } from 'utils'
import { useXGridSearch } from 'utils/hooks'
import { Team } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/system'
import { DataGridPro, GridColumns } from '@mui/x-data-grid-pro'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

export const GET_ALL_TEAMS_BY_ORG = gql`
  query getTeamsByOrg($where: TeamWhere) {
    teams(where: $where) {
      teamId
      name
      logo
      status
      primaryColor
      secondaryColor
      tertiaryColor
    }
  }
`

type TTeams = {
  gameId: string
  teams: {
    host: boolean
    node: Team
    color: string
  }[]
  updateGame: MutationFunction
}

type TParams = {
  organizationSlug: string
}

const Teams: React.FC<TTeams> = props => {
  const { gameId, teams, updateGame } = props
  const { organizationSlug } = useParams<TParams>()

  const [teamDialog, setTeamDialog] = useState(false)
  const isHost = useRef(true)

  const teamHost = useMemo(() => teams.find(t => t.host)?.node, [teams])
  const teamGuest = useMemo(() => teams.find(t => !t.host)?.node, [teams])
  const [
    getAllTeams,
    {
      loading: queryAllTeamsLoading,
      error: queryAllTeamsError,
      data: queryAllTeamsData,
    },
  ] = useLazyQuery(GET_ALL_TEAMS_BY_ORG, {
    variables: {
      orgs: {
        urlSlug: organizationSlug,
      },
    },
  })

  const openTeamDialog = useCallback(({ asHost }) => {
    if (!queryAllTeamsData) {
      getAllTeams()
    }
    isHost.current = asHost
    setTeamDialog(true)
  }, [])

  const handleCloseTeamDialog = useCallback(() => {
    setTeamDialog(false)
    requestSearch('')
  }, [])

  const allTeamsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'logo',
        headerName: 'Logo',
        width: 70,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <img
              style={{ width: '4rem', height: '4rem' }}
              src={params.value}
              alt={params.row.name}
              loading="lazy"
            />
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 300,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        sortable: true,
        disableColumnMenu: true,
      },

      {
        field: 'teamId',
        headerName: 'Member',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Button
              variant={'outlined'}
              size="small"
              startIcon={<AddIcon />}
              type="button"
              onClick={() => {
                updateGame({
                  variables: {
                    where: {
                      gameId,
                    },
                    update: {
                      teams: {
                        connect: {
                          where: {
                            node: { teamId: params.value },
                          },
                          edge: {
                            host: isHost.current,
                          },
                        },
                      },
                    },
                  },
                })
                handleCloseTeamDialog()
              }}
            >
              {`Add ${isHost.current ? 'Host' : 'Guest'} Team`}
            </Button>
          )
        },
      },
    ],
    [gameId]
  )

  const teamsData = useMemo(
    () =>
      queryAllTeamsData
        ? setIdFromEntityId(queryAllTeamsData?.teams || [], 'teamId')
        : [],
    [queryAllTeamsData]
  )

  const searchIndexes = React.useMemo(() => ['name', 'status'], [])

  const [searchText, searchData, requestSearch] = useXGridSearch({
    searchIndexes,
    data: teamsData,
  })

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={6}>
          <TeamCard
            host
            color={teams.find(t => t.host)?.color}
            team={teamHost}
            openTeamDialog={openTeamDialog}
            gameId={gameId}
            updateGame={updateGame}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={6}>
          <TeamCard
            host={false}
            color={teams.find(t => !t.host)?.color}
            team={teamGuest}
            openTeamDialog={openTeamDialog}
            gameId={gameId}
            updateGame={updateGame}
          />
        </Grid>
      </Grid>
      {teamDialog && (
        <Dialog
          fullWidth
          maxWidth="md"
          open={teamDialog}
          onClose={handleCloseTeamDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          {queryAllTeamsLoading && <Loader />}

          <Error message={queryAllTeamsError?.message} />

          {queryAllTeamsData && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add team to game`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600, width: '100%' }}>
                  <DataGridPro
                    columns={allTeamsColumns}
                    rows={sortByStatus(searchData, 'status')}
                    disableSelectionOnClick
                    loading={queryAllTeamsLoading}
                    components={{
                      Toolbar: QuickSearchToolbar,
                    }}
                    componentsProps={{
                      toolbar: {
                        value: searchText,
                        onChange: (
                          event: React.ChangeEvent<HTMLInputElement>
                        ): void => requestSearch(event.target.value),
                        clearSearch: () => requestSearch(''),
                      },
                    }}
                  />
                </div>
              </DialogContent>
            </>
          )}
          <DialogActions>
            <Button type="button" onClick={handleCloseTeamDialog}>
              {'Done'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

type TTeamCard = {
  team?: Team
  color?: string
  host: boolean
  openTeamDialog: ({ asHost }: { asHost: boolean }) => void
  gameId: string
  updateGame: MutationFunction
}

const TeamCard: React.FC<TTeamCard> = props => {
  const {
    team,
    host = false,
    openTeamDialog,
    gameId,
    updateGame,
    color,
  } = props

  return (
    <Paper sx={{ p: '16px' }} style={{ height: '35rem', marginBottom: '2rem' }}>
      <Toolbar
        disableGutters
        sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
      >
        <div>
          <Title>{`${host ? 'Host' : 'Guest'}${
            team ? `: ${team?.name}` : ''
          }`}</Title>
        </div>
        <div>
          {!team && (
            <Button
              variant={'outlined'}
              size="small"
              type="button"
              startIcon={<AddIcon />}
              onClick={() => openTeamDialog({ asHost: host })}
            >
              {'Set Host Team'}
            </Button>
          )}
          {team && (
            <ButtonDialog
              color="secondary"
              text={'Remove Team'}
              textLoading={'Removing...'}
              type="button"
              size="small"
              startIcon={<RemoveIcon />}
              dialogTitle={'Do you really want to remove team from game?'}
              dialogDescription={
                'Team will be removed from this game. Team slot will be empty.'
              }
              dialogNegativeText={'No, keep team'}
              dialogPositiveText={'Yes, remove team'}
              onDialogClosePositive={() =>
                updateGame({
                  variables: {
                    where: {
                      gameId,
                    },
                    update: {
                      teams: {
                        disconnect: {
                          where: {
                            node: {
                              teamId: team.teamId,
                            },
                          },
                        },
                      },
                    },
                  },
                })
              }
            />
          )}
        </div>
      </Toolbar>

      {team && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CardInfo
              gameId={gameId}
              team={team}
              color={color}
              updateGame={updateGame}
            />
          </Grid>
        </Grid>
      )}
    </Paper>
  )
}

const useStylesCard = makeStyles(({ breakpoints, spacing }: Theme) => ({
  cardWrapper: {
    margin: 'auto',
    borderRadius: spacing(2), // 16px
    transition: '0.3s',
    boxShadow: '0px 14px 80px rgba(34, 35, 58, 0.2)',
    position: 'relative',
    maxWidth: 500,
    overflow: 'initial',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: ' flex-start',
    paddingBottom: spacing(2),
    [breakpoints.up('md')]: {
      flexDirection: 'row',
      paddingTop: spacing(2),
    },
  },
  cardMedia: {
    width: '50%',
    marginTop: spacing(-3),
    height: 0,
    paddingBottom: '48%',
    borderRadius: '50%',
    backgroundColor: '#fff',
    position: 'relative',
    alignSelf: 'center',
    [breakpoints.up('md')]: {
      width: '50%',
      marginTop: 0,
      transform: 'translateX(-16px)',
    },
  },
}))

type CardInfoProps = {
  team: Team
  updateGame: MutationFunction
  color?: string
  gameId: string
}

const CardInfo = ({ team, color, updateGame, gameId }: CardInfoProps) => {
  const classes = useStylesCard()
  const [teamColor, setTeamColor] = useState(color || '')
  return (
    <Card className={classes.cardWrapper}>
      <CardMedia className={classes.cardMedia} image={team.logo} />
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          m: 0,
          marginLeft: 0,
          marginRight: 0,
        }}
      >
        <Typography variant="h5" component="h2">
          {team.name}
        </Typography>
        <Typography variant="body1" component="p">
          {'test'}
        </Typography>
        <Box>
          <Select
            sx={{ width: '100%' }}
            placeholder={'Jersey color'}
            variant="standard"
            onChange={event => {
              setTeamColor(event.target.value)
              updateGame({
                variables: {
                  where: {
                    gameId,
                  },
                  update: {
                    teams: {
                      where: {
                        node: {
                          teamId: team.teamId,
                        },
                      },
                      update: {
                        edge: {
                          color: event.target.value,
                        },
                      },
                    },
                  },
                },
              })
            }}
            value={teamColor}
          >
            {team?.primaryColor && (
              <MenuItem value={team.primaryColor}>Primary</MenuItem>
            )}
            {team?.secondaryColor && (
              <MenuItem value={team.secondaryColor}>Secondary</MenuItem>
            )}
            {team?.tertiaryColor && (
              <MenuItem value={team.tertiaryColor}>Tertiary</MenuItem>
            )}
          </Select>
        </Box>
        <AccountBoxIcon sx={{ color: teamColor, fontSize: '8em' }} />
      </CardContent>
    </Card>
  )
}

export { Teams }
