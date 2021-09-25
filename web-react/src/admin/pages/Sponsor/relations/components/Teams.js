import React from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import PropTypes from 'prop-types'

import { useParams } from 'react-router-dom'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccountBox from '@mui/icons-material/AccountBox'
import AddIcon from '@mui/icons-material/Add'

import Toolbar from '@mui/material/Toolbar'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminOrgTeamRoute } from '../../../../../router/routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

export const GET_ALL_TEAMS = gql`
  query getTeams {
    teams {
      teamId
      name
    }
  }
`

const Teams = props => {
  const { sponsorId, sponsor, updateSponsor } = props

  const classes = useStyles()
  const [openAddSponsor, setOpenAddSponsor] = React.useState(false)
  const { organizationSlug } = useParams()
  const handleCloseAddSponsor = React.useCallback(() => {
    setOpenAddSponsor(false)
  }, [])

  const [
    getAllTeams,
    {
      loading: queryAllSponsorsLoading,
      error: queryAllSponsorsError,
      data: queryAllSponsorsData,
    },
  ] = useLazyQuery(GET_ALL_TEAMS, {
    fetchPolicy: 'cache-and-network',
  })

  const handleOpenAddSponsor = React.useCallback(() => {
    if (!queryAllSponsorsData) {
      getAllTeams()
    }
    setOpenAddSponsor(true)
  }, [])

  const sponsorTeamsColumns = React.useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'teamId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgTeamRoute(organizationSlug, params.value)}
            >
              Profile
            </LinkButton>
          )
        },
      },
      {
        field: 'removeButton',
        headerName: 'Detach',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Detach'}
              textLoading={'Detaching...'}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={'Do you really want to detach team from sponsor?'}
              dialogDescription={'You can add it to sponsor later.'}
              dialogNegativeText={'No, keep team'}
              dialogPositiveText={'Yes, detach team'}
              onDialogClosePositive={() => {
                updateSponsor({
                  variables: {
                    where: {
                      sponsorId,
                    },
                    update: {
                      teams: {
                        disconnect: {
                          where: {
                            node: {
                              teamId: params.row.teamId,
                            },
                          },
                        },
                      },
                    },
                  },
                })
              }}
            />
          )
        },
      },
    ],
    []
  )

  const allTeamsColumns = React.useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 300,
      },

      {
        field: 'teamId',
        headerName: 'Membership',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewTeam
              teamId={params.value}
              sponsorId={sponsorId}
              sponsor={sponsor}
              updateSponsor={updateSponsor}
            />
          )
        },
      },
    ],
    [sponsor]
  )

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="teams-content"
        id="teams-header"
      >
        <Typography className={classes.accordionFormTitle}>Teams</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Toolbar disableGutters className={classes.toolbarForm}>
          <div />
          <div>
            <Button
              onClick={handleOpenAddSponsor}
              variant={'outlined'}
              size="small"
              className={classes.submit}
              startIcon={<AddIcon />}
            >
              Add Team
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600 }} className={classes.xGridDialog}>
          <DataGridPro
            columns={sponsorTeamsColumns}
            rows={setIdFromEntityId(sponsor.teams, 'teamId')}
            loading={queryAllSponsorsLoading}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddSponsor}
        onClose={handleCloseAddSponsor}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllSponsorsLoading && !queryAllSponsorsError && <Loader />}
        {queryAllSponsorsError && !queryAllSponsorsLoading && (
          <Error message={queryAllSponsorsError.message} />
        )}
        {queryAllSponsorsData &&
          !queryAllSponsorsLoading &&
          !queryAllSponsorsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add ${sponsor?.name} to team`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <DataGridPro
                    columns={allTeamsColumns}
                    rows={setIdFromEntityId(
                      queryAllSponsorsData.teams,
                      'teamId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllSponsorsLoading}
                    components={{
                      Toolbar: GridToolbar,
                    }}
                  />
                </div>
              </DialogContent>
            </>
          )}
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseAddSponsor()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

const ToggleNewTeam = props => {
  const { sponsorId, teamId, sponsor, updateSponsor } = props
  const [isMember, setIsMember] = React.useState(
    !!sponsor.teams.find(p => p.teamId === teamId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? updateSponsor({
              variables: {
                where: {
                  sponsorId,
                },
                update: {
                  teams: {
                    disconnect: {
                      where: {
                        node: {
                          teamId,
                        },
                      },
                    },
                  },
                },
              },
            })
          : updateSponsor({
              variables: {
                where: {
                  sponsorId,
                },
                update: {
                  teams: {
                    connect: {
                      where: {
                        node: { teamId },
                      },
                    },
                  },
                },
              },
            })
        setIsMember(!isMember)
      }}
      name="teamMember"
      color="primary"
      label={isMember ? 'Member' : 'Not Member'}
    />
  )
}

ToggleNewTeam.propTypes = {
  sponsorId: PropTypes.string,
  teamId: PropTypes.string,
  team: PropTypes.object,
  updateSponsor: PropTypes.func,

  loading: PropTypes.bool,
}

Teams.propTypes = {
  sponsorId: PropTypes.string,
  updateSponsor: PropTypes.func,
  sponsor: PropTypes.object,
}

export { Teams }
