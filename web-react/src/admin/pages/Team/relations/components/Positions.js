import React, { useCallback, useMemo, useState } from 'react'
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
// import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
// import CreateIcon from '@material-ui/icons/Create'
import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
// import Autocomplete from '@material-ui/core/Autocomplete'
// import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import LoadingButton from '@material-ui/lab/LoadingButton'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
// import { getAdminPositionRoute } from '../../../../../routes'
// import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { arrayToStringList } from '../../../../../utils'

const READ_POSITIONS = gql`
  query getPositions($teamId: ID) {
    team: Team(teamId: $teamId) {
      teamId
      name
      positions {
        positionId
        name
        nick
        short
        description
        players {
          playerId
          name
        }
      }
    }
  }
`
// const MERGE_POSITION

const REMOVE_TEAM_PLAYER = gql`
  mutation removeTeamPosition($teamId: ID!, $positionId: ID!) {
    RemoveTeamPositions(
      from: { teamId: $teamId }
      to: { positionId: $positionId }
    ) {
      from {
        teamId
      }
    }
  }
`

export const GET_ALL_POSITIONS = gql`
  query getPositions {
    positions: Position {
      positionId
      name
    }
  }
`

const MERGE_TEAM_PLAYER = gql`
  mutation mergeTeamPosition($teamId: ID!, $positionId: ID!) {
    teamPosition: MergeTeamPositions(
      from: { teamId: $teamId }
      to: { positionId: $positionId }
    ) {
      from {
        teamId
      }
    }
  }
`

const Positions = props => {
  const { teamId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddPosition, setOpenAddPosition] = useState(false)
  const [addedPosition, setAddedPosition] = useState(null)
  const handleCloseAddPosition = useCallback(() => {
    setOpenAddPosition(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(READ_POSITIONS)

  const [
    getAllPositions,
    {
      loading: queryAllPositionsLoading,
      error: queryAllPositionsError,
      data: queryAllPositionsData,
    },
  ] = useLazyQuery(GET_ALL_POSITIONS)

  const [mergeTeamPosition, { loading: mutationLoadingMerge }] = useMutation(
    MERGE_TEAM_PLAYER,
    {
      update(cache, { data: { teamPosition } }) {
        const queryResult = cache.readQuery({
          query: READ_POSITIONS,
          variables: {
            teamId,
          },
        })
        const existingPositions = queryResult.team[0].positions
        const newPosition = teamPosition.from

        const updatedResult = {
          team: [
            {
              positions: [newPosition, ...existingPositions],
            },
          ],
        }
        cache.writeQuery({
          query: READ_POSITIONS,
          data: updatedResult,
        })
      },
      onCompleted: () => {
        handleCloseAddPosition()
        setAddedPosition(null)
        enqueueSnackbar('Position added to team!', { variant: 'success' })
      },
    }
  )

  const team = useMemo(() => queryData && queryData.team && queryData.team[0], [
    queryData,
  ])
  // console.log('team:', team)
  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { teamId } })
    }
  }, [])

  const handleOpenAddPosition = useCallback(() => {
    if (!queryAllPositionsData) {
      getAllPositions()
    }
    setOpenAddPosition(true)
  }, [])

  const addPositionToTeam = useCallback(() => {
    mergeTeamPosition({
      variables: {
        teamId,
        positionId: addedPosition.positionId,
      },
    })
  }, [addedPosition])

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="positions-content"
        id="positions-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Positions
        </Typography>
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
                    onClick={handleOpenAddPosition}
                    variant={'outlined'}
                    size="small"
                    className={classes.submit}
                    startIcon={<AddIcon />}
                  >
                    Add Position
                  </Button>
                  {/* TODO: MAKE Modal */}

                  {/* <LinkButton
                    startIcon={<CreateIcon />}
                    to={getAdminPositionRoute('new')}
                  >
                    Create
                  </LinkButton> */}
                </div>
              </Toolbar>
              <Table aria-label="collapsible table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Players</TableCell>
                    <TableCell align="right">Nick</TableCell>
                    <TableCell align="right">Short</TableCell>
                    <TableCell align="right">Description</TableCell>
                    <TableCell align="right">Edit</TableCell>
                    <TableCell align="right">Unlink</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {team.positions.map(position => (
                    <PositionRow
                      key={position.positionId}
                      position={position}
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
        open={openAddPosition}
        onClose={handleCloseAddPosition}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllPositionsLoading && !queryAllPositionsError && <Loader />}
        {queryAllPositionsError && !queryAllPositionsLoading && (
          <Error message={queryAllPositionsError.message} />
        )}
        {queryAllPositionsData &&
          !queryAllPositionsLoading &&
          !queryAllPositionsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add new position to ${
                team && team.name
              }`}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {`Select position from list:`}
                </DialogContentText>
                {/* <Autocomplete
                  fullWidth
                  id="positions"
                  value={addedPosition}
                  onChange={(_, value) => {
                    setAddedPosition(value)
                  }}
                  options={queryAllPositionsData.positions || []}
                  getOptionLabel={option => option.name}
                  getOptionSelected={(option, value) =>
                    option.positionId === value.positionId
                  }
                  renderOption={(props, object) => {
                    return (
                      <li
                        {...props}
                        key={`${object.positionId}_${object.name}`}
                      >
                        {object.name}
                      </li>
                    )
                  }}
                  name="positions"
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Positions"
                      variant="standard"
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password', // disable autocomplete and autofill
                      }}
                    />
                  )}
                /> */}
              </DialogContent>
            </>
          )}
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseAddPosition()
            }}
          >
            {'Cancel'}
          </Button>

          <LoadingButton
            type="button"
            variant="contained"
            onClick={() => {
              addPositionToTeam()
            }}
            pending={mutationLoadingMerge}
          >
            {mutationLoadingMerge ? 'Adding...' : 'Add new position'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

const PositionRow = props => {
  const { position, teamId } = props

  const { enqueueSnackbar } = useSnackbar()

  const [removeTeamPosition, { loading }] = useMutation(REMOVE_TEAM_PLAYER, {
    update(cache, { data: { teamPosition } }) {
      const queryResult = cache.readQuery({
        query: READ_POSITIONS,
        variables: {
          teamId,
        },
      })
      const updatedPositions = queryResult.team[0].positions.filter(
        p => p.positionId !== teamPosition.from.positionId
      )

      const updatedResult = {
        team: [
          {
            positions: updatedPositions,
          },
        ],
      }
      cache.writeQuery({
        query: READ_POSITIONS,
        data: updatedResult,
      })
    },
    onCompleted: () => {
      enqueueSnackbar('Position removed from team', {
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
        {position.name}
      </TableCell>
      <TableCell align="right">
        {arrayToStringList(position.players, 'playerId', 'name')}
      </TableCell>
      <TableCell align="right">{position.nick}</TableCell>
      <TableCell align="right">{position.short}</TableCell>
      <TableCell align="right">{position.description}</TableCell>
      <TableCell align="right">
        {/* <LinkButton
          startIcon={<EditIcon />}
          variant={'outlined'}
          to={getAdminPositionRoute(position.positionId)}
        >
          Edit
        </LinkButton> */}
      </TableCell>
      <TableCell align="right">
        <ButtonDialog
          text={'Unlink'}
          textLoading={'Unlinking...'}
          loading={loading}
          size="small"
          startIcon={<LinkOffIcon />}
          dialogTitle={'Do you really want to unlink position from the team?'}
          dialogDescription={
            'The position will remain in the database. You can add him to the team later.'
          }
          dialogNegativeText={'No, keep the position'}
          dialogPositiveText={'Yes, detach position'}
          onDialogClosePositive={() => {
            removeTeamPosition({
              variables: {
                teamId,
                positionId: position.positionId,
              },
            })
          }}
        />
      </TableCell>
    </TableRow>
  )
}

Positions.propTypes = {
  teamId: PropTypes.string,
}

export { Positions }
