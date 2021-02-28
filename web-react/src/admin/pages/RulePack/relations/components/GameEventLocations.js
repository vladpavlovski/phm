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
import EditIcon from '@material-ui/icons/Edit'
import CreateIcon from '@material-ui/icons/Create'
import Toolbar from '@material-ui/core/Toolbar'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'

import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import LoadingButton from '@material-ui/lab/LoadingButton'
import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

import { RHFInput } from '../../../../../components/RHFInput'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_GAME_EVENT_LOCATIONS = gql`
  query getRulePack($rulePackId: ID) {
    rulePack: RulePack(rulePackId: $rulePackId) {
      rulePackId
      name
      gameEventLocations {
        gameEventLocationId
        name
        fieldX
        fieldY
      }
    }
  }
`

const MERGE_RULEPACK_GAME_EVENT_LOCATION = gql`
  mutation mergeRulePackGameEventLocation(
    $rulePackId: ID!
    $gameEventLocationId: ID!
    $name: String
    $fieldX: String
    $fieldY: String
  ) {
    gameEventLocation: MergeGameEventLocation(
      gameEventLocationId: $gameEventLocationId
      name: $name
      fieldX: $fieldX
      fieldY: $fieldY
    ) {
      gameEventLocationId
      name
    }
    gameEventLocationRulePack: MergeGameEventLocationRulePack(
      from: { rulePackId: $rulePackId }
      to: { gameEventLocationId: $gameEventLocationId }
    ) {
      from {
        name
      }
      to {
        gameEventLocationId
        name
        fieldX
        fieldY
      }
    }
  }
`

const DELETE_GAME_EVENT_LOCATION = gql`
  mutation deleteGameEventLocation($gameEventLocationId: ID!) {
    deleted: DeleteGameEventLocation(
      gameEventLocationId: $gameEventLocationId
    ) {
      gameEventLocationId
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  fieldX: string().required('Field X is required'),
  fieldY: string().required('Field Y is required'),
})

const GameEventLocations = props => {
  const { rulePackId } = props

  const classes = useStyles()
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_GAME_EVENT_LOCATIONS, {
    fetchPolicy: 'cache-and-network',
  })

  const rulePack = queryData?.rulePack?.[0]

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { rulePackId } })
    }
  }, [])

  const handleOpenDialog = useCallback(data => {
    formData.current = data
    setOpenDialog(true)
  }, [])

  const [
    deleteGameEventLocation,
    { loading: mutationLoadingRemove },
  ] = useMutation(DELETE_GAME_EVENT_LOCATION, {
    update(cache, { data: { deleted } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_GAME_EVENT_LOCATIONS,
          variables: {
            rulePackId,
          },
        })
        const updatedData = queryResult.rulePack[0].gameEventLocations.filter(
          p => p.gameEventLocationId !== deleted.gameEventLocationId
        )

        const updatedResult = {
          rulePack: [
            {
              ...queryResult.rulePack[0],
              gameEventLocations: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_GAME_EVENT_LOCATIONS,
          data: updatedResult,
          variables: {
            rulePackId,
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

  const rulePackGameEventLocationsColumns = useMemo(
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
              size="small"
              startIcon={<DeleteForeverIcon />}
              dialogTitle={
                'Do you really want to delete this game event location?'
              }
              dialogDescription={
                'Game event location will be completely delete'
              }
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() =>
                deleteGameEventLocation({
                  variables: {
                    gameEventLocationId: params.row.gameEventLocationId,
                  },
                })
              }
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
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
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
              <XGrid
                columns={rulePackGameEventLocationsColumns}
                rows={setIdFromEntityId(
                  rulePack.gameEventLocations,
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
        rulePack={rulePack}
        rulePackId={rulePackId}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        data={formData.current}
      />
    </Accordion>
  )
}

const FormDialog = props => {
  const { rulePack, rulePackId, openDialog, handleCloseDialog, data } = props

  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [
    mergeRulePackGameEventLocation,
    { loading: loadingMergeGameEventLocation },
  ] = useMutation(MERGE_RULEPACK_GAME_EVENT_LOCATION, {
    update(cache, { data: { gameEventLocationRulePack } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_GAME_EVENT_LOCATIONS,
          variables: {
            rulePackId,
          },
        })

        const existingData = queryResult.rulePack[0].gameEventLocations
        const newItem = gameEventLocationRulePack.to
        let updatedData = []
        if (
          existingData.find(
            ed => ed.gameEventLocationId === newItem.gameEventLocationId
          )
        ) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.gameEventLocationId === newItem.gameEventLocationId
              ? newItem
              : ed
          )
        } else {
          // add new item if item not in array
          updatedData = [newItem, ...existingData]
        }

        const updatedResult = {
          rulePack: [
            {
              ...queryResult.rulePack[0],
              gameEventLocations: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_GAME_EVENT_LOCATIONS,
          data: updatedResult,
          variables: {
            rulePackId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.gameEventLocationRulePack.to.name} added to ${rulePack.name}!`,
        {
          variant: 'success',
        }
      )
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
        const { name, fieldX, fieldY } = dataToCheck

        mergeRulePackGameEventLocation({
          variables: {
            rulePackId,
            name,
            fieldX,
            fieldY,
            gameEventLocationId: data?.gameEventLocationId || uuidv4(),
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={classes.form}
        noValidate
        autoComplete="off"
      >
        <DialogTitle id="alert-dialog-title">{`Add new game event location to ${rulePack?.name}`}</DialogTitle>
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
            onClick={() => {
              handleCloseDialog()
            }}
          >
            {'Cancel'}
          </Button>
          <LoadingButton type="submit" pending={loadingMergeGameEventLocation}>
            {loadingMergeGameEventLocation ? 'Saving...' : 'Save'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

GameEventLocations.propTypes = {
  rulePackId: PropTypes.string,
}

export { GameEventLocations }
