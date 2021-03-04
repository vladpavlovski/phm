import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AccountBox from '@material-ui/icons/AccountBox'
import AddIcon from '@material-ui/icons/Add'

import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminTeamRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_TEAMS = gql`
  query getSponsorTeams($sponsorId: ID) {
    sponsor: Sponsor(sponsorId: $sponsorId) {
      sponsorId
      name
      teams {
        teamId
        name
      }
    }
  }
`

const REMOVE_SPONSOR_TEAM = gql`
  mutation removeSponsorTeam($sponsorId: ID!, $teamId: ID!) {
    sponsorTeam: RemoveSponsorTeams(
      from: { teamId: $teamId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        teamId
        name
      }
      to {
        sponsorId
        name
      }
    }
  }
`

export const GET_ALL_TEAMS = gql`
  query getTeams {
    teams: Team {
      teamId
      name
    }
  }
`

const MERGE_SPONSOR_TEAM = gql`
  mutation mergeSponsorTeams($sponsorId: ID!, $teamId: ID!) {
    sponsorTeam: MergeSponsorTeams(
      from: { teamId: $teamId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        teamId
        name
      }
      to {
        sponsorId
        name
      }
    }
  }
`

const Teams = props => {
  const { sponsorId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddSponsor, setOpenAddSponsor] = useState(false)

  const handleCloseAddSponsor = useCallback(() => {
    setOpenAddSponsor(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_TEAMS, {
    fetchPolicy: 'cache-and-network',
  })

  const sponsor = queryData?.sponsor?.[0]

  const [
    getAllSponsors,
    {
      loading: queryAllSponsorsLoading,
      error: queryAllSponsorsError,
      data: queryAllSponsorsData,
    },
  ] = useLazyQuery(GET_ALL_TEAMS, {
    fetchPolicy: 'cache-and-network',
  })

  const [removeTeamSponsor, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_SPONSOR_TEAM,
    {
      update(cache, { data: { sponsorTeam } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_TEAMS,
            variables: {
              sponsorId,
            },
          })
          const updatedData = queryResult?.sponsor?.[0]?.teams.filter(
            p => p.teamId !== sponsorTeam.from.teamId
          )

          const updatedResult = {
            sponsor: [
              {
                ...queryResult?.sponsor?.[0],
                teams: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_TEAMS,
            data: updatedResult,
            variables: {
              sponsorId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.sponsorTeam.from.name} not sponsored by ${sponsor.name}!`,
          {
            variant: 'info',
          }
        )
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const [mergeTeamSponsor] = useMutation(MERGE_SPONSOR_TEAM, {
    update(cache, { data: { sponsorTeam } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_TEAMS,
          variables: {
            sponsorId,
          },
        })
        const existingData = queryResult?.sponsor?.[0]?.teams
        const newItem = sponsorTeam.from
        const updatedResult = {
          sponsor: [
            {
              ...queryResult?.sponsor?.[0],
              teams: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_TEAMS,
          data: updatedResult,
          variables: {
            sponsorId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.sponsorTeam.from.name} sponsored by ${sponsor.name}!`,
        {
          variant: 'success',
        }
      )
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { sponsorId } })
    }
  }, [])

  const handleOpenAddSponsor = useCallback(() => {
    if (!queryAllSponsorsData) {
      getAllSponsors()
    }
    setOpenAddSponsor(true)
  }, [])

  const sponsorTeamsColumns = useMemo(
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
              to={getAdminTeamRoute(params.value)}
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
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={'Do you really want to detach team from sponsor?'}
              dialogDescription={'You can add it to sponsor later.'}
              dialogNegativeText={'No, keep team'}
              dialogPositiveText={'Yes, detach team'}
              onDialogClosePositive={() => {
                removeTeamSponsor({
                  variables: {
                    sponsorId,
                    teamId: params.row.teamId,
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

  const allTeamsColumns = useMemo(
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
              merge={mergeTeamSponsor}
              remove={removeTeamSponsor}
            />
          )
        },
      },
    ],
    [sponsor]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="teams-content"
        id="teams-header"
      >
        <Typography className={classes.accordionFormTitle}>Teams</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
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
              <XGrid
                columns={sponsorTeamsColumns}
                rows={setIdFromEntityId(sponsor.teams, 'teamId')}
                loading={queryAllSponsorsLoading}
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </div>
          </>
        )}
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
                  <XGrid
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
  const { sponsorId, teamId, sponsor, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!sponsor.teams.find(p => p.teamId === teamId)
  )

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={isMember}
          onChange={() => {
            isMember
              ? remove({
                  variables: {
                    sponsorId,
                    teamId,
                  },
                })
              : merge({
                  variables: {
                    sponsorId,
                    teamId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="teamMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not Member'}
    />
  )
}

ToggleNewTeam.propTypes = {
  sponsorId: PropTypes.string,
  teamId: PropTypes.string,
  team: PropTypes.object,
  removeTeamSponsor: PropTypes.func,
  mergeTeamSponsor: PropTypes.func,
  loading: PropTypes.bool,
}

Teams.propTypes = {
  sponsorId: PropTypes.string,
}

export { Teams }
