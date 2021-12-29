import React, { useCallback, useState, useMemo, useRef } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'

import { useSnackbar } from 'notistack'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { object, string } from 'yup'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import CreateIcon from '@mui/icons-material/Create'
import Toolbar from '@mui/material/Toolbar'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import LoadingButton from '@mui/lab/LoadingButton'
import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

import { RHFInput, Error, Loader } from 'components'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from 'utils'
import { GameEventLocation } from 'utils/types'
const GET_GAME_EVENT_LOCATIONS = gql`
  query getRulePack($where: GameEventLocationWhere) {
    gameEventLocations(where: $where) {
      gameEventLocationId
      name
      fieldX
      fieldY
    }
  }
`

const CREATE_GAME_EVENT_LOCATION = gql`
  mutation createGameEventLocation($input: [GameEventLocationCreateInput!]!) {
    createGameEventLocations(input: $input) {
      gameEventLocations {
        gameEventLocationId
        name
        fieldX
        fieldY
      }
    }
  }
`

const UPDATE_GAME_EVENT_LOCATION = gql`
  mutation updateGameEventLocation(
    $where: GameEventLocationWhere
    $update: GameEventLocationUpdateInput
  ) {
    updateGameEventLocations(where: $where, update: $update) {
      gameEventLocations {
        gameEventLocationId
        name
        fieldX
        fieldY
      }
    }
  }
`

const DELETE_GAME_EVENT_LOCATION = gql`
  mutation deleteGameEventLocation($where: GameEventLocationWhere) {
    deleteGameEventLocations(where: $where) {
      nodesDeleted
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  fieldX: string().required('Field X is required'),
  fieldY: string().required('Field Y is required'),
})

type TRelations = {
  rulePackId: string
}

type TQueryTypeData = {
  gameEventLocations: GameEventLocation[]
}

type TQueryTypeVars = {
  where: {
    rulePack: {
      rulePackId: string
    }
  }
}

const GameEventLocations: React.FC<TRelations> = props => {
  const { rulePackId } = props

  const classes = useStyles()
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef<GameEventLocation | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery<TQueryTypeData, TQueryTypeVars>(GET_GAME_EVENT_LOCATIONS, {
    variables: {
      where: { rulePack: { rulePackId } },
    },
  })

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData()
    }
  }, [])

  const handleOpenDialog = useCallback(data => {
    formData.current = data
    setOpenDialog(true)
  }, [])

  const [deleteGameEventLocation, { loading: mutationLoadingRemove }] =
    useMutation(DELETE_GAME_EVENT_LOCATION, {
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_GAME_EVENT_LOCATIONS,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const updatedData = queryResult?.gameEventLocations?.filter(
            p => p.gameEventLocationId !== formData.current?.gameEventLocationId
          )

          const updatedResult = {
            gameEventLocations: updatedData,
          }
          cache.writeQuery({
            query: GET_GAME_EVENT_LOCATIONS,
            data: updatedResult,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar(`GameEventLocation was deleted!`, {
          variant: 'info',
        })
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    })

  const rulePackGameEventLocationsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'fieldX',
        headerName: 'fieldX',
        width: 100,
      },
      {
        field: 'fieldY',
        headerName: 'fieldY',
        width: 100,
      },
      {
        field: 'gameEventLocationId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Button
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
        field: 'removeButton',
        headerName: 'Delete',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Delete'}
              textLoading={'Deleting...'}
              loading={mutationLoadingRemove}
              dialogTitle={
                'Do you really want to delete this game event location?'
              }
              dialogDescription={
                'Game event location will be completely delete'
              }
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() => {
                formData.current = params.row
                deleteGameEventLocation({
                  variables: {
                    where: {
                      gameEventLocationId: params.row.gameEventLocationId,
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

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="game-event-locations-content"
        id="game-event-locations-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Game Event Locations{' '}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {queryData && (
          <>
            <Toolbar disableGutters className={classes.toolbarForm}>
              <div />
              <div>
                <Button
                  onClick={handleOpenDialog}
                  variant={'outlined'}
                  size="small"
                  className={classes.submit}
                  startIcon={<CreateIcon />}
                >
                  Create
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <DataGridPro
                columns={rulePackGameEventLocationsColumns}
                rows={setIdFromEntityId(
                  queryData?.gameEventLocations,
                  'gameEventLocationId'
                )}
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
        rulePackId={rulePackId}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        data={formData.current}
      />
    </Accordion>
  )
}

type TFormDialog = {
  rulePackId: string
  openDialog: boolean
  handleCloseDialog: () => void
  data: GameEventLocation | null
}

const FormDialog: React.FC<TFormDialog> = React.memo(props => {
  const { rulePackId, openDialog, handleCloseDialog, data } = props

  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [createGameEventLocation, { loading: mutationLoadingCreate }] =
    useMutation(CREATE_GAME_EVENT_LOCATION, {
      update(cache, { data: { createGameEventLocations } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_GAME_EVENT_LOCATIONS,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const newItem = createGameEventLocations?.gameEventLocations?.[0]

          const existingData = queryResult?.gameEventLocations || []
          const updatedData = [newItem, ...existingData]
          const updatedResult = {
            gameEventLocations: updatedData,
          }
          cache.writeQuery({
            query: GET_GAME_EVENT_LOCATIONS,
            data: updatedResult,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar('Position type saved!', { variant: 'success' })
        handleCloseDialog()
      },
      onError: error => {
        enqueueSnackbar(`Error: ${error}`, {
          variant: 'error',
        })
      },
    })

  const [updateGameEventLocation, { loading: mutationLoadingUpdate }] =
    useMutation(UPDATE_GAME_EVENT_LOCATION, {
      update(cache, { data: { updateGameEventLocations } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_GAME_EVENT_LOCATIONS,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })

          const newItem = updateGameEventLocations?.gameEventLocations?.[0]

          const existingData = queryResult?.gameEventLocations || []
          const updatedData = existingData?.map(ed =>
            ed.gameEventLocationId === newItem.gameEventLocationId
              ? newItem
              : ed
          )
          const updatedResult = {
            gameEventLocations: updatedData,
          }
          cache.writeQuery({
            query: GET_GAME_EVENT_LOCATIONS,
            data: updatedResult,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar('Position type updated!', { variant: 'success' })
        handleCloseDialog()
      },
      onError: error => {
        enqueueSnackbar(`Error: ${error}`, {
          variant: 'error',
        })
      },
    })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { name, fieldX, fieldY } = dataToCheck

        data?.gameEventLocationId
          ? updateGameEventLocation({
              variables: {
                where: {
                  gameEventLocationId: data?.gameEventLocationId,
                },
                update: {
                  name,
                  fieldX,
                  fieldY,
                },
              },
            })
          : createGameEventLocation({
              variables: {
                input: {
                  name,
                  fieldX,
                  fieldY,

                  rulePack: {
                    connect: {
                      where: {
                        node: { rulePackId },
                      },
                    },
                  },
                },
              },
            })
      } catch (error) {
        console.error(error)
      }
    },
    [rulePackId, data]
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
      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <DialogTitle id="alert-dialog-title">{`Add new game event location`}</DialogTitle>
        <DialogContent>
          <Container>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12} md={12} lg={12}>
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
                      defaultValue={data?.fieldX || ''}
                      name="fieldX"
                      label="Field X"
                      required
                      fullWidth
                      variant="standard"
                      error={errors?.fieldX}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFInput
                      control={control}
                      defaultValue={data?.fieldY || ''}
                      name="fieldY"
                      label="Field Y"
                      required
                      fullWidth
                      variant="standard"
                      error={errors?.fieldY}
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
          <LoadingButton
            type="submit"
            loading={mutationLoadingCreate || mutationLoadingUpdate}
          >
            {mutationLoadingCreate || mutationLoadingUpdate
              ? 'Saving...'
              : 'Save'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
})

export { GameEventLocations }
