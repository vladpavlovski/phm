import React, { useCallback, useState } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import CreateIcon from '@material-ui/icons/Create'
import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Autocomplete from '@material-ui/core/Autocomplete'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import LoadingButton from '@material-ui/lab/LoadingButton'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminSponsorRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
// import { arrayToStringList } from '../../../../../utils'

const READ_SPONSORS = gql`
  query getSponsors($teamId: ID) {
    team: Team(teamId: $teamId) {
      teamId
      name
      sponsors {
        sponsorId
        name
        description
      }
    }
  }
`

const REMOVE_TEAM_PLAYER = gql`
  mutation removeTeamSponsor($teamId: ID!, $sponsorId: ID!) {
    teamSponsor: RemoveTeamSponsors(
      from: { teamId: $teamId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        teamId
      }
      to {
        sponsorId
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

const MERGE_TEAM_PLAYER = gql`
  mutation mergeTeamSponsor($teamId: ID!, $sponsorId: ID!) {
    teamSponsor: MergeTeamSponsors(
      from: { teamId: $teamId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        teamId
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
  const { teamId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddSponsor, setOpenAddSponsor] = useState(false)
  const [addedSponsor, setAddedSponsor] = useState(null)
  const handleCloseAddSponsor = useCallback(() => {
    setOpenAddSponsor(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(READ_SPONSORS)

  const [
    getAllSponsors,
    {
      loading: queryAllSponsorsLoading,
      error: queryAllSponsorsError,
      data: queryAllSponsorsData,
    },
  ] = useLazyQuery(GET_ALL_SPONSORS)

  const [mergeTeamSponsor, { loading: mutationLoadingMerge }] = useMutation(
    MERGE_TEAM_PLAYER,
    {
      update(cache, { data: { teamSponsor } }) {
        try {
          // console.log('queryData: ', queryData)
          const queryResult = cache.readQuery({
            query: READ_SPONSORS,
            variables: {
              teamId,
            },
          })

          // console.log('queryResult: ', queryResult)
          const existingSponsors = queryResult.team[0].sponsors
          const newSponsor = teamSponsor.to
          // console.log('existingSponsors: ', existingSponsors)
          // console.log('newSponsor: ', newSponsor)
          const updatedResult = {
            team: [
              {
                ...queryResult.team[0],
                sponsors: [newSponsor, ...existingSponsors],
              },
            ],
          }
          cache.writeQuery({
            query: READ_SPONSORS,
            data: updatedResult,
            variables: {
              teamId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        handleCloseAddSponsor()
        setAddedSponsor(null)
        enqueueSnackbar('Sponsor added to team!', { variant: 'success' })
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const team = queryData && queryData.team && queryData.team[0]
  console.log('team:', team)
  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { teamId } })
    }
  }, [])

  const handleOpenAddSponsor = useCallback(() => {
    if (!queryAllSponsorsData) {
      getAllSponsors()
    }
    setOpenAddSponsor(true)
  }, [])

  const addSponsorToTeam = useCallback(() => {
    mergeTeamSponsor({
      variables: {
        teamId,
        sponsorId: addedSponsor.sponsorId,
      },
    })
  }, [addedSponsor])

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
            <TableContainer>
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
                    to={getAdminSponsorRoute('new')}
                  >
                    Create
                  </LinkButton>
                </div>
              </Toolbar>
              <Table aria-label="collapsible table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Description</TableCell>
                    <TableCell align="right">Edit</TableCell>
                    <TableCell align="right">Unlink</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {team.sponsors.map(sponsor => (
                    <SponsorRow
                      key={sponsor.sponsorId}
                      sponsor={sponsor}
                      teamId={teamId}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </AccordionDetails>
      <Dialog
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
                team && team.name
              }`}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {`Select sponsor from list:`}
                </DialogContentText>
                <Autocomplete
                  fullWidth
                  id="sponsors"
                  value={addedSponsor}
                  onChange={(_, value) => {
                    setAddedSponsor(value)
                  }}
                  options={queryAllSponsorsData.sponsors || []}
                  getOptionLabel={option => option.name}
                  getOptionSelected={(option, value) =>
                    option.sponsorId === value.sponsorId
                  }
                  renderOption={(props, object) => {
                    return (
                      <li {...props} key={`${object.sponsorId}_${object.name}`}>
                        {object.name}
                      </li>
                    )
                  }}
                  name="sponsors"
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Sponsors"
                      variant="standard"
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password', // disable autocomplete and autofill
                      }}
                    />
                  )}
                />
              </DialogContent>
            </>
          )}
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseAddSponsor()
            }}
          >
            {'Cancel'}
          </Button>

          <LoadingButton
            type="button"
            variant="contained"
            onClick={() => {
              addSponsorToTeam()
            }}
            pending={mutationLoadingMerge}
          >
            {mutationLoadingMerge ? 'Adding...' : 'Add new sponsor'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

const SponsorRow = props => {
  const { sponsor, teamId } = props

  const { enqueueSnackbar } = useSnackbar()

  const [removeTeamSponsor, { loading }] = useMutation(REMOVE_TEAM_PLAYER, {
    update(cache, { data: { teamSponsor } }) {
      try {
        const queryResult = cache.readQuery({
          query: READ_SPONSORS,
          variables: {
            teamId,
          },
        })
        // console.log('queryResult', queryResult)
        const updatedSponsors = queryResult.team[0].sponsors.filter(
          p => p.sponsorId !== teamSponsor.to.sponsorId
        )
        // console.log('updatedSponsors: ', updatedSponsors)

        const updatedResult = {
          team: [
            {
              ...queryResult.team[0],
              sponsors: updatedSponsors,
            },
          ],
        }
        cache.writeQuery({
          query: READ_SPONSORS,
          data: updatedResult,
          variables: {
            teamId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('Sponsor removed from team', {
        variant: 'info',
      })
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
    },
  })

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {sponsor.name}
      </TableCell>

      <TableCell align="right">{sponsor.description}</TableCell>
      <TableCell align="right">
        <LinkButton
          startIcon={<EditIcon />}
          variant={'outlined'}
          to={getAdminSponsorRoute(sponsor.sponsorId)}
        >
          Edit
        </LinkButton>
      </TableCell>
      <TableCell align="right">
        <ButtonDialog
          text={'Unlink'}
          textLoading={'Unlinking...'}
          loading={loading}
          size="small"
          startIcon={<LinkOffIcon />}
          dialogTitle={'Do you really want to unlink sponsor from the team?'}
          dialogDescription={
            'The sponsor will remain in the database. You can add him to the team later.'
          }
          dialogNegativeText={'No, keep the sponsor'}
          dialogPositiveText={'Yes, detach sponsor'}
          onDialogClosePositive={() => {
            removeTeamSponsor({
              variables: {
                teamId,
                sponsorId: sponsor.sponsorId,
              },
            })
          }}
        />
      </TableCell>
    </TableRow>
  )
}

Sponsors.propTypes = {
  teamId: PropTypes.string,
}

export { Sponsors }
