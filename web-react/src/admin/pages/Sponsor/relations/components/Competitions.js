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
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminCompetitionRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_COMPETITIONS = gql`
  query getSponsor($sponsorId: ID) {
    sponsor: Sponsor(sponsorId: $sponsorId) {
      _id
      sponsorId
      name
      competitions {
        competitionId
        name
        nick
      }
    }
  }
`

const REMOVE_SPONSOR_COMPETITION = gql`
  mutation removeSponsorCompetition($sponsorId: ID!, $competitionId: ID!) {
    sponsorCompetition: RemoveSponsorCompetitions(
      from: { competitionId: $competitionId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        competitionId
        name
        nick
      }
    }
  }
`

export const GET_ALL_COMPETITIONS = gql`
  query getCompetitions {
    competitions: Competition {
      competitionId
      name
      nick
    }
  }
`

const MERGE_SPONSOR_COMPETITION = gql`
  mutation mergeSponsorCompetition($sponsorId: ID!, $competitionId: ID!) {
    sponsorCompetition: MergeSponsorCompetitions(
      from: { competitionId: $competitionId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        competitionId
        name
        nick
      }
    }
  }
`

const Competitions = props => {
  const { sponsorId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddCompetition, setOpenAddCompetition] = useState(false)

  const handleCloseAddCompetition = useCallback(() => {
    setOpenAddCompetition(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_COMPETITIONS, {
    fetchPolicy: 'cache-and-network',
  })

  const sponsor = queryData && queryData.sponsor && queryData.sponsor[0]

  const [
    getAllCompetitions,
    {
      loading: queryAllCompetitionsLoading,
      error: queryAllCompetitionsError,
      data: queryAllCompetitionsData,
    },
  ] = useLazyQuery(GET_ALL_COMPETITIONS, {
    fetchPolicy: 'cache-and-network',
  })

  const [
    removeSponsorCompetition,
    { loading: mutationLoadingRemove },
  ] = useMutation(REMOVE_SPONSOR_COMPETITION, {
    update(cache, { data: { sponsorCompetition } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_COMPETITIONS,
          variables: {
            sponsorId,
          },
        })
        const updatedCompetitions = queryResult.sponsor[0].competitions.filter(
          p => p.competitionId !== sponsorCompetition.from.competitionId
        )

        const updatedResult = {
          sponsor: [
            {
              ...queryResult.sponsor[0],
              competitions: updatedCompetitions,
            },
          ],
        }
        cache.writeQuery({
          query: GET_COMPETITIONS,
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
        `${data.sponsorCompetition.from.name} not sponsored by ${sponsor.name}!`,
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
  })

  const [mergeSponsorCompetition] = useMutation(MERGE_SPONSOR_COMPETITION, {
    update(cache, { data: { sponsorCompetition } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_COMPETITIONS,
          variables: {
            sponsorId,
          },
        })
        const existingCompetitions = queryResult.sponsor[0].competitions
        const newCompetition = sponsorCompetition.from
        const updatedResult = {
          sponsor: [
            {
              ...queryResult.sponsor[0],
              competitions: [newCompetition, ...existingCompetitions],
            },
          ],
        }
        cache.writeQuery({
          query: GET_COMPETITIONS,
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
        `${data.sponsorCompetition.from.name} sponsored by ${sponsor.name}!`,
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

  const handleOpenAddCompetition = useCallback(() => {
    if (!queryAllCompetitionsData) {
      getAllCompetitions()
    }
    setOpenAddCompetition(true)
  }, [])

  const sponsorCompetitionsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'nick',
        headerName: 'Nick',
        width: 300,
      },

      {
        field: 'competitionId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminCompetitionRoute(params.value)}
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
                'Do you really want to detach competition from the sponsor?'
              }
              dialogNick={'You can add him to sponsor later.'}
              dialogNegativeText={'No, keep competition'}
              dialogPositiveText={'Yes, detach competition'}
              onDialogClosePositive={() => {
                removeSponsorCompetition({
                  variables: {
                    sponsorId,
                    competitionId: params.row.competitionId,
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

  const allCompetitionsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'nick',
        headerName: 'Nick',
        width: 300,
      },

      {
        field: 'competitionId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewCompetition
              competitionId={params.value}
              sponsorId={sponsorId}
              sponsor={sponsor}
              merge={mergeSponsorCompetition}
              remove={removeSponsorCompetition}
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
        aria-controls="competitions-content"
        id="competitions-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Competitions
        </Typography>
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
                  onClick={handleOpenAddCompetition}
                  variant={'outlined'}
                  size="small"
                  className={classes.submit}
                  startIcon={<AddIcon />}
                >
                  Add Competition
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={sponsorCompetitionsColumns}
                rows={setIdFromEntityId(sponsor.competitions, 'competitionId')}
                loading={queryAllCompetitionsLoading}
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
        open={openAddCompetition}
        onClose={handleCloseAddCompetition}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-nick"
      >
        {queryAllCompetitionsLoading && !queryAllCompetitionsError && (
          <Loader />
        )}
        {queryAllCompetitionsError && !queryAllCompetitionsLoading && (
          <Error message={queryAllCompetitionsError.message} />
        )}
        {queryAllCompetitionsData &&
          !queryAllCompetitionsLoading &&
          !queryAllCompetitionsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add competition to ${
                sponsor && sponsor.name
              }`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allCompetitionsColumns}
                    rows={setIdFromEntityId(
                      queryAllCompetitionsData.competitions,
                      'competitionId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllCompetitionsLoading}
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
              handleCloseAddCompetition()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

const ToggleNewCompetition = props => {
  const { competitionId, sponsorId, sponsor, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!sponsor.competitions.find(p => p.competitionId === competitionId)
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
                    sponsorId,
                    competitionId,
                  },
                })
              : merge({
                  variables: {
                    sponsorId,
                    competitionId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="sponsorMember"
          color="primary"
        />
      }
      label={isMember ? 'Sponsored' : 'Not sponsored'}
    />
  )
}

ToggleNewCompetition.propTypes = {
  competitionId: PropTypes.string,
  sponsorId: PropTypes.string,
  sponsor: PropTypes.object,
  removeSponsorCompetition: PropTypes.func,
  mergeSponsorCompetition: PropTypes.func,
}

Competitions.propTypes = {
  sponsorId: PropTypes.string,
}

export { Competitions }
