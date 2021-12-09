import React from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccountBox from '@mui/icons-material/AccountBox'
import CreateIcon from '@mui/icons-material/Create'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import { ButtonDialog } from '../../../../commonComponents/ButtonDialog'
import { getAdminOrgPlayerRoute } from 'router/routes'
import { LinkButton } from 'components/LinkButton'
import { useStyles } from '../../../../commonComponents/styled'
import { XGridLogo } from '../../../../commonComponents/XGridLogo'
import { setIdFromEntityId, getXGridValueFromArray, sortByStatus } from 'utils'
import { AddPlayer } from './AddPlayer'
import { SetPlayerPosition, PlayerPositionDialog } from './SetPlayerPosition'
import { SetPlayerJersey, PlayerJerseyDialog } from './SetPlayerJersey'
import { TeamPlayersProvider } from './context/Provider'
import placeholderPerson from 'img/placeholderPerson.jpg'

const PlayersComponent = props => {
  const { teamId, team, updateTeam } = props

  const classes = useStyles()
  const { organizationSlug } = useParams()

  const teamPlayersColumns = React.useMemo(
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
                size="small"
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
      // {
      //   field: 'removeButton',
      //   headerName: 'Remove',
      //   width: 120,
      //   disableColumnMenu: true,
      //   renderCell: params => {
      //     return (
      //       <ButtonDialog
      //         text={'Remove'}
      //         textLoading={'Removing...'}
      //         size="small"
      //         startIcon={<LinkOffIcon />}
      //         dialogTitle={'Do you really want to remove player from the team?'}
      //         dialogDescription={
      //           'The player will remain in the database. You can add him to any team later.'
      //         }
      //         dialogNegativeText={'No, keep the player'}
      //         dialogPositiveText={'Yes, remove player'}
      //         onDialogClosePositive={() => {
      //           updateTeam({
      //             variables: {
      //               where: {
      //                 teamId,
      //               },
      //               update: {
      //                 players: {
      //                   disconnect: {
      //                     where: {
      //                       node: {
      //                         playerId: params.row.playerId,
      //                       },
      //                     },
      //                   },
      //                 },
      //               },
      //             },
      //           })
      //         }}
      //       />
      //     )
      //   },
      // },
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
          <Typography className={classes.accordionFormTitle}>
            Players
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Toolbar disableGutters className={classes.toolbarForm}>
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
          <div style={{ height: 600 }} className={classes.xGridDialog}>
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
      <PlayerPositionDialog teamId={teamId} team={team} />
      <PlayerJerseyDialog teamId={teamId} team={team} />
    </TeamPlayersProvider>
  )
}

PlayersComponent.propTypes = {
  teamId: PropTypes.string,
}

const Players = React.memo(PlayersComponent)

export { Players }
