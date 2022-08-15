import { PlayerLevel } from 'admin/pages/Player/components/PlayerLevel'
import { LinkButton } from 'components/LinkButton'
import placeholderPerson from 'img/placeholderPerson.jpg'
import React from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgPlayerRoute } from 'router/routes'
import { createCtx, getXGridValueFromArray, setIdFromEntityId, sortByStatus } from 'utils'
import { Player, Team } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import AccountBox from '@mui/icons-material/AccountBox'
import CreateIcon from '@mui/icons-material/Create'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'
import { ButtonDialog } from '../../../../commonComponents/ButtonDialog'
import { XGridLogo } from '../../../../commonComponents/XGridLogo'
import { AddPlayer } from './AddPlayer'
import { PlayerJerseyDialog, SetPlayerJersey } from './SetPlayerJersey'
import { PlayerPositionDialog, SetPlayerPosition } from './SetPlayerPosition'

type TTeamPlayer = {
  playerPositionDialogOpen: boolean
  playerJerseyDialogOpen: boolean
  playerData: Player | null
}
const [ctx, TeamPlayersProvider] = createCtx<TTeamPlayer>({
  playerPositionDialogOpen: false,
  playerJerseyDialogOpen: false,
  playerData: null as unknown as Player,
})
export const TeamPlayersContext = ctx

type TPlayers = {
  teamId: string
  updateTeam: MutationFunction
  team: Team
}

type TPlayersParams = {
  organizationSlug: string
}

const Players: React.FC<TPlayers> = React.memo(props => {
  const { teamId, team, updateTeam } = props

  const { organizationSlug } = useParams<TPlayersParams>()

  const teamPlayersColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'playerId',
        headerName: 'Actions',
        width: 100,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <>
              <LinkButton
                to={getAdminOrgPlayerRoute(organizationSlug, params.value)}
                target="_blank"
                icon
              >
                <Tooltip arrow title="Open Profile" placement="top">
                  <AccountBox />
                </Tooltip>
              </LinkButton>
              <ButtonDialog
                icon={
                  <Tooltip arrow title="Remove Player" placement="top">
                    <RemoveCircleOutlineIcon />
                  </Tooltip>
                }
                dialogTitle={
                  'Do you really want to remove player from the team?'
                }
                dialogDescription={
                  'The player will remain in the database. You can add him to any team later.'
                }
                dialogNegativeText={'No, keep the player'}
                dialogPositiveText={'Yes, remove player'}
                onDialogClosePositive={() => {
                  updateTeam({
                    variables: {
                      where: {
                        teamId,
                      },
                      update: {
                        players: {
                          disconnect: {
                            where: {
                              node: {
                                playerId: params.row.playerId,
                              },
                            },
                          },
                        },
                      },
                    },
                  })
                }}
              />
            </>
          )
        },
      },
      {
        field: 'avatar',
        headerName: 'Photo',
        width: 80,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <XGridLogo
              src={params.value}
              placeholder={placeholderPerson}
              alt={params.row.name}
            />
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },
      {
        field: 'levelCode',
        headerName: 'Level',
        width: 150,
        renderCell: params => {
          return <PlayerLevel code={params.value} />
        },
      },
      {
        field: 'activityStatus',
        headerName: 'Activity Status',
        width: 150,
      },
      {
        field: 'positions',
        headerName: 'Positions',
        width: 200,
        renderCell: params => {
          return (
            <>
              <SetPlayerPosition player={params.row} />
              <span style={{ marginLeft: '4px' }}>
                {getXGridValueFromArray(params.row.positions, 'name')}
              </span>
            </>
          )
        },
      },
      {
        field: 'jerseys',
        headerName: 'Jerseys',
        width: 200,
        renderCell: params => {
          return (
            <>
              <SetPlayerJersey player={params.row} />
              <span style={{ marginLeft: '4px' }}>
                {getXGridValueFromArray(params.row.jerseys, 'name')}
              </span>
            </>
          )
        },
      },
    ],
    [team, teamId]
  )

  const gridRows = React.useMemo(() => {
    const data = setIdFromEntityId(team.players, 'playerId')
    return sortByStatus(data, 'activityStatus')
  }, [team.players])

  return (
    <TeamPlayersProvider>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="players-content"
          id="players-header"
        >
          <Typography>Players</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Toolbar
            disableGutters
            sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
          >
            <div />
            <div>
              <AddPlayer team={team} teamId={teamId} updateTeam={updateTeam} />

              <LinkButton
                startIcon={<CreateIcon />}
                to={getAdminOrgPlayerRoute(organizationSlug, 'new')}
                target="_blank"
              >
                Create
              </LinkButton>
            </div>
          </Toolbar>
          <div style={{ height: 600, width: '100%' }}>
            <DataGridPro
              columns={teamPlayersColumns}
              rows={gridRows}
              components={{
                Toolbar: GridToolbar,
              }}
            />
          </div>
        </AccordionDetails>
      </Accordion>
      <PlayerPositionDialog team={team} />
      <PlayerJerseyDialog team={team} />
    </TeamPlayersProvider>
  )
})

export { Players }
