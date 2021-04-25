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
// import CreateIcon from '@material-ui/icons/Create'
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

const GET_OCCUPATIONS = gql`
  query getOccupations($teamId: ID) {
    team: Team(teamId: $teamId) {
      teamId
      name
      occupations {
        occupationId
        name
        description
      }
    }
  }
`

const DELETE_TEAM_OCCUPATION = gql`
  mutation deleteTeamOccupation($teamId: ID!, $occupationId: ID!) {
    teamOccupation: RemoveTeamOccupations(
      from: { teamId: $teamId }
      to: { occupationId: $occupationId }
    ) {
      from {
        teamId
      }
      to {
        occupationId
        name
      }
    }
    occupation: DeleteOccupation(occupationId: $occupationId) {
      occupationId
    }
  }
`

const MERGE_TEAM_OCCUPATION = gql`
  mutation mergeTeamOccupation(
    $teamId: ID!
    $occupationId: ID!
    $name: String!
    $description: String
  ) {
    occupation: MergeOccupation(
      occupationId: $occupationId
      name: $name
      description: $description
    ) {
      occupationId
      name
      description
    }
    teamOccupation: MergeTeamOccupations(
      from: { teamId: $teamId }
      to: { occupationId: $occupationId }
    ) {
      from {
        teamId
      }
      to {
        occupationId
        name
        description
      }
    }
  }
`

// const CREATE_DEFAULT_OCCUPATIONS = gql`
//   mutation createOccupations($teamId: ID!, $systemSettingsId: ID!) {
//     defaultOccupations: CreateTeamDefaultOccupations(
//       teamId: $teamId
//       systemSettingsId: $systemSettingsId
//     ) {
//       occupationId
//       name
//       description
//     }
//   }
// `

const Occupations = props => {
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
  ] = useLazyQuery(GET_OCCUPATIONS)

  const team = queryData && queryData.team && queryData.team[0]

  const [
    deleteTeamOccupation,
    { loading: mutationLoadingDelete },
  ] = useMutation(DELETE_TEAM_OCCUPATION, {
    update(cache, { data: { teamOccupation } }) {
      // TODO:
      try {
        const queryResult = cache.readQuery({
          query: GET_OCCUPATIONS,
          variables: {
            teamId,
          },
        })

        const updatedOccupations = queryResult.team[0].occupations.filter(
          p => p.occupationId !== teamOccupation.to.occupationId
        )

        const updatedResult = {
          team: [
            {
              ...queryResult.team[0],
              occupations: updatedOccupations,
            },
          ],
        }
        cache.writeQuery({
          query: GET_OCCUPATIONS,
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
        `${data.teamOccupation.to.name} not occupation ${team.name}`,
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

  // const [
  //   createDefaultOccupations,
  //   { loading: queryCreateDefaultLoading },
  // ] = useMutation(CREATE_DEFAULT_OCCUPATIONS, {
  //   variables: {
  //     teamId,
  //     systemSettingsId: 'system-settings',
  //   },

  //   update(cache, { data: { defaultOccupations } }) {
  //     try {
  //       const queryResult = cache.readQuery({
  //         query: GET_OCCUPATIONS,
  //         variables: {
  //           teamId,
  //         },
  //       })

  //       const updatedResult = {
  //         team: [
  //           {
  //             ...queryResult.team[0],
  //             occupations: defaultOccupations,
  //           },
  //         ],
  //       }
  //       cache.writeQuery({
  //         query: GET_OCCUPATIONS,
  //         data: updatedResult,
  //         variables: {
  //           teamId,
  //         },
  //       })
  //     } catch (error) {
  //       console.error(error)
  //     }
  //   },
  //   onCompleted: () => {
  //     enqueueSnackbar(`Default occupations added to ${team.name}!`, {
  //       variant: 'success',
  //     })
  //   },
  //   onError: error => {
  //     enqueueSnackbar(`Error happened :( ${error}`, {
  //       variant: 'error',
  //     })
  //     console.error(error)
  //   },
  // })

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { teamId } })
    }
  }, [])

  const handleOpenDialog = useCallback(data => {
    formData.current = data
    setOpenDialog(true)
  }, [])

  const teamOccupationsColumns = useMemo(
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
        field: 'occupationId',
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
              dialogTitle={'Do you really want to delete team occupation?'}
              dialogDescription={
                'Occupation will completely delete from database.'
              }
              dialogNegativeText={'No, keep occupation'}
              dialogPositiveText={'Yes, delete occupation'}
              onDialogClosePositive={() => {
                deleteTeamOccupation({
                  variables: {
                    teamId,
                    occupationId: params.row.occupationId,
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
        aria-controls="occupations-content"
        id="occupations-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Occupations
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
                  Create Occupation
                </Button>

                {/* {team?.occupations?.length === 0 && (
                  <LoadingButton
                    type="button"
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={createDefaultOccupations}
                    className={classes.submit}
                    startIcon={<CreateIcon />}
                    pending={queryCreateDefaultLoading}
                    pendingOccupation="start"
                  >
                    {queryCreateDefaultLoading
                      ? 'Creating...'
                      : 'Create default'}
                  </LoadingButton>
                )} */}
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={teamOccupationsColumns}
                rows={setIdFromEntityId(team.occupations, 'occupationId')}
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
})

const FormDialog = props => {
  const { team, teamId, openDialog, handleCloseDialog, data } = props

  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [
    mergeTeamOccupation,
    { loading: loadingMergeOccupationType },
  ] = useMutation(MERGE_TEAM_OCCUPATION, {
    update(cache, { data: { teamOccupation } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_OCCUPATIONS,
          variables: {
            teamId,
          },
        })

        const existingData = queryResult.team[0].occupations
        const newItem = teamOccupation.to

        let updatedData = []
        if (existingData.find(ed => ed.occupationId === newItem.occupationId)) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.occupationId === newItem.occupationId ? newItem : ed
          )
        } else {
          // add new item if item not in array
          updatedData = [newItem, ...existingData]
        }

        const updatedResult = {
          team: [
            {
              ...queryResult.team[0],
              occupations: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_OCCUPATIONS,
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
      enqueueSnackbar(`${data.teamOccupation.to.name} saved to ${team.name}!`, {
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
        mergeTeamOccupation({
          variables: {
            teamId,
            ...dataToCheck,
            occupationId: data?.occupationId || uuidv4(),
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
        <DialogTitle id="alert-dialog-title">{`Add new occupation to ${team?.name}`}</DialogTitle>
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
          <LoadingButton type="submit" pending={loadingMergeOccupationType}>
            {loadingMergeOccupationType ? 'Saving...' : 'Save'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

Occupations.propTypes = {
  teamId: PropTypes.string,
}

export { Occupations }
