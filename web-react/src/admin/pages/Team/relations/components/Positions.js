import React, { useCallback, useState, useMemo, useRef } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { v4 as uuidv4 } from 'uuid'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { object, string } from 'yup'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'
import CreateIcon from '@material-ui/icons/Create'
import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import LoadingButton from '@material-ui/lab/LoadingButton'

import { XGrid, GridToolbar } from '@material-ui/x-grid'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import { RHFInput } from '../../../../../components/RHFInput'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_POSITIONS = gql`
  query getPositions($teamId: ID) {
    team: Team(teamId: $teamId) {
      teamId
      name
      positions {
        positionId
        name
        short
        description
      }
    }
  }
`

const DELETE_TEAM_POSITION = gql`
  mutation deleteTeamPosition($teamId: ID!, $positionId: ID!) {
    teamPosition: RemoveTeamPositions(
      from: { teamId: $teamId }
      to: { positionId: $positionId }
    ) {
      from {
        teamId
      }
      to {
        positionId
        name
      }
    }
    position: DeletePosition(positionId: $positionId) {
      positionId
    }
  }
`

const MERGE_TEAM_POSITION = gql`
  mutation mergeTeamPosition(
    $teamId: ID!
    $positionId: ID!
    $name: String!
    $short: String
    $description: String
  ) {
    position: MergePosition(
      positionId: $positionId
      name: $name
      short: $short
      description: $description
    ) {
      positionId
      name
      short
      description
    }
    teamPosition: MergeTeamPositions(
      from: { teamId: $teamId }
      to: { positionId: $positionId }
    ) {
      from {
        teamId
      }
      to {
        positionId
        name
        short
        description
      }
    }
  }
`

const CREATE_DEFAULT_POSITIONS = gql`
  mutation createPositions($teamId: ID!, $systemSettingsId: ID!) {
    defaultPositions: CreateTeamDefaultPositions(
      teamId: $teamId
      systemSettingsId: $systemSettingsId
    ) {
      positionId
      name
      short
      description
    }
  }
`

const Positions = props => {
  const { teamId } = props
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef(null)
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_POSITIONS)

  const team = queryData && queryData.team && queryData.team[0]

  const [deleteTeamPosition, { loading: mutationLoadingDelete }] = useMutation(
    DELETE_TEAM_POSITION,
    {
      update(cache, { data: { teamPosition } }) {
        // TODO:
        try {
          const queryResult = cache.readQuery({
            query: GET_POSITIONS,
            variables: {
              teamId,
            },
          })

          const updatedPositions = queryResult.team[0].positions.filter(
            p => p.positionId !== teamPosition.to.positionId
          )

          const updatedResult = {
            team: [
              {
                ...queryResult.team[0],
                positions: updatedPositions,
              },
            ],
          }
          cache.writeQuery({
            query: GET_POSITIONS,
            data: updatedResult,
            variables: {
              teamId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.teamPosition.to.name} not position ${team.name}`,
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
    }
  )

  const [
    createDefaultPositions,
    { loading: queryCreateDefaultLoading },
  ] = useMutation(CREATE_DEFAULT_POSITIONS, {
    variables: {
      teamId,
      systemSettingsId: 'system-settings',
    },

    update(cache, { data: { defaultPositions } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_POSITIONS,
          variables: {
            teamId,
          },
        })

        const updatedResult = {
          team: [
            {
              ...queryResult.team[0],
              positions: defaultPositions,
            },
          ],
        }
        cache.writeQuery({
          query: GET_POSITIONS,
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
      enqueueSnackbar(`Default positions added to ${team.name}!`, {
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

  const handleOpenDialog = useCallback(data => {
    formData.current = data
    setOpenDialog(true)
  }, [])

  const teamPositionsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },

      {
        field: 'short',
        headerName: 'Short',
        width: 200,
      },

      {
        field: 'description',
        headerName: 'Description',
        width: 200,
      },

      {
        field: 'positionId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Button
              type="button"
              onClick={() => handleOpenDialog(params.row)}
              variant={'outlined'}
              size="small"
              className={classes.submit}
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
          )
        },
      },
      {
        field: 'deleteButton',
        headerName: 'Delete',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Delete'}
              textLoading={'Deleting...'}
              loading={mutationLoadingDelete}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={'Do you really want to delete team position?'}
              dialogDescription={
                'Position will completely delete from database.'
              }
              dialogNegativeText={'No, keep position'}
              dialogPositiveText={'Yes, delete position'}
              onDialogClosePositive={() => {
                deleteTeamPosition({
                  variables: {
                    teamId,
                    positionId: params.row.positionId,
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
            <Toolbar disableGutters className={classes.toolbarForm}>
              <div />
              <div>
                <Button
                  type="button"
                  onClick={handleOpenDialog}
                  variant={'outlined'}
                  size="small"
                  className={classes.submit}
                  startIcon={<AddIcon />}
                >
                  Create Position
                </Button>

                {team?.positions?.length === 0 && (
                  <LoadingButton
                    type="button"
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={createDefaultPositions}
                    className={classes.submit}
                    startIcon={<CreateIcon />}
                    loading={queryCreateDefaultLoading}
                    loadingPosition="start"
                  >
                    {queryCreateDefaultLoading
                      ? 'Creating...'
                      : 'Create default'}
                  </LoadingButton>
                )}
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={teamPositionsColumns}
                rows={setIdFromEntityId(team.positions, 'positionId')}
                loading={queryLoading}
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </div>
          </>
        )}
      </AccordionDetails>
      <FormDialog
        team={team}
        teamId={teamId}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        data={formData.current}
      />
    </Accordion>
  )
}

const schema = object().shape({
  name: string().required('Name is required'),
  description: string(),
  short: string(),
})

const FormDialog = props => {
  const { team, teamId, openDialog, handleCloseDialog, data } = props

  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [
    mergeTeamPosition,
    { loading: loadingMergePositionType },
  ] = useMutation(MERGE_TEAM_POSITION, {
    update(cache, { data: { teamPosition } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_POSITIONS,
          variables: {
            teamId,
          },
        })

        const existingData = queryResult.team[0].positions
        const newItem = teamPosition.to

        let updatedData = []
        if (existingData.find(ed => ed.positionId === newItem.positionId)) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.positionId === newItem.positionId ? newItem : ed
          )
        } else {
          // add new item if item not in array
          updatedData = [newItem, ...existingData]
        }

        const updatedResult = {
          team: [
            {
              ...queryResult.team[0],
              positions: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_POSITIONS,
          data: updatedResult,
          variables: {
            teamId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(`${data.teamPosition.to.name} saved to ${team.name}!`, {
        variant: 'success',
      })
      handleCloseDialog()
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        mergeTeamPosition({
          variables: {
            teamId,
            ...dataToCheck,
            positionId: data?.positionId || uuidv4(),
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    [teamId, data]
  )

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={openDialog}
      onClose={handleCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={classes.form}
        noValidate
        autoComplete="off"
      >
        <DialogTitle id="alert-dialog-title">{`Add new position to ${team?.name}`}</DialogTitle>
        <DialogContent>
          <Container>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFInput
                      control={control}
                      defaultValue={data?.name || ''}
                      name="name"
                      label="Name"
                      required
                      fullWidth
                      variant="standard"
                      error={errors?.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFInput
                      control={control}
                      defaultValue={data?.short || ''}
                      name="short"
                      label="Short"
                      fullWidth
                      variant="standard"
                      error={errors?.short}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFInput
                      control={control}
                      defaultValue={data?.description || ''}
                      name="description"
                      label="Description"
                      fullWidth
                      variant="standard"
                      error={errors?.description}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </DialogContent>

        <DialogActions>
          <Button
            type="button"
            onClick={() => {
              handleCloseDialog()
            }}
          >
            {'Cancel'}
          </Button>
          <LoadingButton type="submit" loading={loadingMergePositionType}>
            {loadingMergePositionType ? 'Saving...' : 'Save'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

Positions.propTypes = {
  teamId: PropTypes.string,
}

export { Positions }
