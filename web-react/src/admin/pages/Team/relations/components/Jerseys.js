import React, { useCallback, useMemo } from 'react'
// useState
import PropTypes from 'prop-types'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
// useMutation
import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
// import AccountBox from '@material-ui/icons/AccountBox'
// import AddIcon from '@material-ui/icons/Add'
import CreateIcon from '@material-ui/icons/Create'
import Toolbar from '@material-ui/core/Toolbar'
// import LinkOffIcon from '@material-ui/icons/LinkOff'
// import Dialog from '@material-ui/core/Dialog'
// import DialogActions from '@material-ui/core/DialogActions'
// import DialogContent from '@material-ui/core/DialogContent'
// import DialogTitle from '@material-ui/core/DialogTitle'
import LoadingButton from '@material-ui/lab/LoadingButton'
// import FormControlLabel from '@material-ui/core/FormControlLabel'
// import Checkbox from '@material-ui/core/Checkbox'

import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_JERSEYS = gql`
  query getTeam($teamId: ID) {
    team: Team(teamId: $teamId) {
      teamId
      name
      jerseys {
        jerseyId
        name
        number
        player {
          playerId
          firstName
          lastName
        }
      }
    }
  }
`

const CREATE_JERSEYS = gql`
  mutation createJerseys($teamId: ID!, $nameBase: String!) {
    jerseys: CreateJerseys(teamId: $teamId, nameBase: $nameBase) {
      jerseyId
      name
      number
    }
  }
`

const Jerseys = props => {
  const { teamId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  // const [openAddJersey, setOpenAddJersey] = useState(false)

  // const handleCloseAddJersey = useCallback(() => {
  //   setOpenAddJersey(false)
  // }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_JERSEYS, {
    fetchPolicy: 'cache-and-network',
  })

  const team = queryData && queryData.team && queryData.team[0]

  const [
    createJerseys,
    {
      loading: queryCreateLoading,
      // error: queryCreateError,
      // data: queryCreateData,
    },
  ] = useMutation(CREATE_JERSEYS, {
    variables: {
      teamId,
      nameBase: team?.name,
    },

    update(cache, { data: { jerseys } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_JERSEYS,
          variables: {
            teamId,
          },
        })

        const updatedResult = {
          team: [
            {
              ...queryResult.team[0],
              jerseys,
            },
          ],
        }
        cache.writeQuery({
          query: GET_JERSEYS,
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
      enqueueSnackbar(`Jerseys added to ${team.name}!`, {
        variant: 'success',
      })
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
      getData({ variables: { teamId } })
    }
  }, [])

  const teamJerseysColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'number',
        headerName: 'Number',
        width: 140,
      },
      // {
      //   field: 'jerseyId',
      //   headerName: 'Edit',
      //   width: 120,
      //   disableColumnMenu: true,
      //   renderCell: params => {
      //     return (
      //       <LinkButton
      //         startIcon={<AccountBox />}
      //         to={getAdminJerseyRoute(params.value)}
      //       >
      //         Profile
      //       </LinkButton>
      //     )
      //   },
      // },
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
      //         loading={mutationLoadingRemove}
      //         size="small"
      //         startIcon={<LinkOffIcon />}
      //         dialogTitle={'Do you really want to remove jersey from the team?'}
      //         dialogDescription={
      //           'The jersey will remain in the database. You can add him to any team later.'
      //         }
      //         dialogNegativeText={'No, keep the jersey'}
      //         dialogPositiveText={'Yes, remove jersey'}
      //         onDialogClosePositive={() => {
      //           removeTeamJersey({
      //             variables: {
      //               teamId,
      //               jerseyId: params.row.jerseyId,
      //             },
      //           })
      //         }}
      //       />
      //     )
      //   },
      // },
    ],
    []
  )

  // const allJerseysColumns = useMemo(
  //   () => [
  //     {
  //       field: 'name',
  //       headerName: 'Name',
  //       width: 150,
  //     },
  //     {
  //       field: 'teams',
  //       headerName: 'Teams',
  //       width: 200,
  //       valueGetter: params => {
  //         return getXGridValueFromArray(params.row.teams, 'name')
  //       },
  //     },
  //     {
  //       field: 'positions',
  //       headerName: 'Positions',
  //       width: 200,
  //       valueGetter: params => {
  //         return getXGridValueFromArray(params.row.positions, 'name')
  //       },
  //     },

  //     {
  //       field: 'jerseyId',
  //       headerName: 'Member',
  //       width: 150,
  //       disableColumnMenu: true,
  //       renderCell: params => {
  //         return (
  //           <ToggleNewJersey
  //             jerseyId={params.value}
  //             teamId={teamId}
  //             team={team}
  //             merge={mergeTeamJersey}
  //             remove={removeTeamJersey}
  //           />
  //         )
  //       },
  //     },
  //   ],
  //   [team]
  // )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="jerseys-content"
        id="jerseys-header"
      >
        <Typography className={classes.accordionFormTitle}>Jerseys</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            {team?.jerseys?.length === 0 && (
              <Toolbar disableGutters className={classes.toolbarForm}>
                <div />
                <div>
                  {/* <Button
                    onClick={handleOpenAddJersey}
                    variant={'outlined'}
                    size="small"
                    className={classes.submit}
                    startIcon={<AddIcon />}
                  >
                    Add Jersey
                  </Button> */}
                  {/* TODO: MAKE Modal */}

                  {/* <LinkButton
                  startIcon={<CreateIcon />}
                  // to={getAdminJerseyRoute('new')}
                >
                  
                </LinkButton> */}
                  <LoadingButton
                    type="button"
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={createJerseys}
                    className={classes.submit}
                    startIcon={<CreateIcon />}
                    pending={queryCreateLoading}
                    pendingPosition="start"
                  >
                    {queryCreateLoading ? 'Creating...' : 'Create'}
                  </LoadingButton>
                  {/* <Button
                    onClick={() => {
                      createJerseys()
                    }}
                    variant={'outlined'}
                    size="small"
                    className={classes.submit}
                    startIcon={<CreateIcon />}
                  >
                    Create
                  </Button> */}
                </div>
              </Toolbar>
            )}
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={teamJerseysColumns}
                rows={setIdFromEntityId(team.jerseys, 'jerseyId')}
                loading={queryLoading}
                components={{
                  Toolbar: GridToolbar,
                }}
                sortModel={[
                  {
                    field: 'number',
                    sort: 'asc',
                  },
                ]}
              />
            </div>
          </>
        )}
      </AccordionDetails>
      {/* <Dialog
          fullWidth
          maxWidth="md"
          open={openAddJersey}
          onClose={handleCloseAddJersey}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          {queryAllJerseysLoading && !queryAllJerseysError && <Loader />}
          {queryAllJerseysError && !queryAllJerseysLoading && (
            <Error message={queryAllJerseysError.message} />
          )}
          {queryAllJerseysData &&
            !queryAllJerseysLoading &&
            !queryAllJerseysError && (
              <>
                <DialogTitle id="alert-dialog-title">{`Add new jersey to ${
                  team && team.name
                }`}</DialogTitle>
                <DialogContent>
                  <div style={{ height: 600 }} className={classes.xGridDialog}>
                    <XGrid
                      columns={allJerseysColumns}
                      rows={setIdFromEntityId(
                        queryAllJerseysData.jerseys,
                        'jerseyId'
                      )}
                      disableSelectionOnClick
                      loading={queryAllJerseysLoading}
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
                handleCloseAddJersey()
              }}
            >
              {'Done'}
            </Button>
          </DialogActions>
        </Dialog>*/}
    </Accordion>
  )
}

Jerseys.propTypes = {
  teamId: PropTypes.string,
}

export { Jerseys }
