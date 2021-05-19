import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AddIcon from '@material-ui/icons/Add'
import CreateIcon from '@material-ui/icons/Create'
import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import AccountBox from '@material-ui/icons/AccountBox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminOrgSponsorRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_SPONSORS = gql`
  query getSponsors($competitionId: ID) {
    competition: Competition(competitionId: $competitionId) {
      competitionId
      name
      sponsors {
        sponsorId
        name
        description
      }
    }
  }
`

const REMOVE_TEAM_SPONSOR = gql`
  mutation removeCompetitionSponsor($competitionId: ID!, $sponsorId: ID!) {
    competitionSponsor: RemoveCompetitionSponsors(
      from: { competitionId: $competitionId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        competitionId
      }
      to {
        sponsorId
        name
      }
    }
  }
`

export const GET_ALL_SPONSORS = gql`
  query getSponsors {
    sponsors: Sponsor {
      sponsorId
      name
    }
  }
`

const MERGE_TEAM_SPONSOR = gql`
  mutation mergeCompetitionSponsor($competitionId: ID!, $sponsorId: ID!) {
    competitionSponsor: MergeCompetitionSponsors(
      from: { competitionId: $competitionId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        competitionId
      }
      to {
        sponsorId
        name
        description
      }
    }
  }
`

const Sponsors = props => {
  const { competitionId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const { organizationSlug } = useParams()
  const [openAddSponsor, setOpenAddSponsor] = useState(false)

  const handleCloseAddSponsor = useCallback(() => {
    setOpenAddSponsor(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_SPONSORS)

  const [
    getAllSponsors,
    {
      loading: queryAllSponsorsLoading,
      error: queryAllSponsorsError,
      data: queryAllSponsorsData,
    },
  ] = useLazyQuery(GET_ALL_SPONSORS)

  const [mergeCompetitionSponsor] = useMutation(MERGE_TEAM_SPONSOR, {
    update(cache, { data: { competitionSponsor } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_SPONSORS,
          variables: {
            competitionId,
          },
        })

        const existingSponsors = queryResult.competition[0].sponsors
        const newSponsor = competitionSponsor.to
        const updatedResult = {
          competition: [
            {
              ...queryResult.competition[0],
              sponsors: [newSponsor, ...existingSponsors],
            },
          ],
        }
        cache.writeQuery({
          query: GET_SPONSORS,
          data: updatedResult,
          variables: {
            competitionId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.competitionSponsor.to.name} is ${competition.name} sponsor!`,
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

  const competition =
    queryData && queryData.competition && queryData.competition[0]

  const [
    removeCompetitionSponsor,
    { loading: mutationLoadingRemove },
  ] = useMutation(REMOVE_TEAM_SPONSOR, {
    update(cache, { data: { competitionSponsor } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_SPONSORS,
          variables: {
            competitionId,
          },
        })

        const updatedSponsors = queryResult.competition[0].sponsors.filter(
          p => p.sponsorId !== competitionSponsor.to.sponsorId
        )

        const updatedResult = {
          competition: [
            {
              ...queryResult.competition[0],
              sponsors: updatedSponsors,
            },
          ],
        }
        cache.writeQuery({
          query: GET_SPONSORS,
          data: updatedResult,
          variables: {
            competitionId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.competitionSponsor.to.name} not sponsor ${competition.name}`,
        {
          variant: 'info',
        }
      )
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
    },
  })

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { competitionId } })
    }
  }, [])

  const handleOpenAddSponsor = useCallback(() => {
    if (!queryAllSponsorsData) {
      getAllSponsors()
    }
    setOpenAddSponsor(true)
  }, [])

  const competitionSponsorsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'description',
        headerName: 'Description',
        width: 200,
      },

      {
        field: 'sponsorId',
        headerName: 'Profile',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgSponsorRoute(organizationSlug, params.value)}
            >
              Profile
            </LinkButton>
          )
        },
      },
      {
        field: 'removeButton',
        headerName: 'Remove',
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
              dialogTitle={
                'Do you really want to detach sponsor from the competition?'
              }
              dialogDescription={'You can add it later.'}
              dialogNegativeText={'No, keep sponsor'}
              dialogPositiveText={'Yes, detach sponsor'}
              onDialogClosePositive={() => {
                removeCompetitionSponsor({
                  variables: {
                    competitionId,
                    sponsorId: params.row.sponsorId,
                  },
                })
              }}
            />
          )
        },
      },
    ],
    [organizationSlug]
  )

  const allSponsorsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },
      {
        field: 'description',
        headerName: 'Description',
        width: 200,
      },
      {
        field: 'sponsorId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewSponsor
              sponsorId={params.value}
              competitionId={competitionId}
              competition={competition}
              merge={mergeCompetitionSponsor}
              remove={removeCompetitionSponsor}
            />
          )
        },
      },
    ],
    [competition]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="sponsors-content"
        id="sponsors-header"
      >
        <Typography className={classes.accordionFormTitle}>Sponsors</Typography>
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
                  Add Sponsor
                </Button>
                {/* TODO: MAKE Modal */}

                <LinkButton
                  startIcon={<CreateIcon />}
                  to={getAdminOrgSponsorRoute(organizationSlug, 'new')}
                >
                  Create
                </LinkButton>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={competitionSponsorsColumns}
                rows={setIdFromEntityId(competition.sponsors, 'sponsorId')}
                loading={queryLoading}
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
              <DialogTitle id="alert-dialog-title">{`Add new sponsor to ${
                competition && competition.name
              }`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allSponsorsColumns}
                    rows={setIdFromEntityId(
                      queryAllSponsorsData.sponsors,
                      'sponsorId'
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

const ToggleNewSponsor = props => {
  const { sponsorId, competitionId, competition, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!competition.sponsors.find(p => p.sponsorId === sponsorId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            isMember
              ? remove({
                  variables: {
                    competitionId,
                    sponsorId,
                  },
                })
              : merge({
                  variables: {
                    competitionId,
                    sponsorId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="sponsorMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not member'}
    />
  )
}

ToggleNewSponsor.propTypes = {
  playerId: PropTypes.string,
  competitionId: PropTypes.string,
  competition: PropTypes.object,
  remove: PropTypes.func,
  merge: PropTypes.func,
}

Sponsors.propTypes = {
  competitionId: PropTypes.string,
}

export { Sponsors }
