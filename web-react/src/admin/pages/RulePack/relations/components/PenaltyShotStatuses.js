import React, { useCallback, useState, useMemo, useRef } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
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

const GET_PENALTY_SHOT_STATUSES = gql`
  query getRulePack(
    $where: PenaltyShotStatusWhere
    $whereRulePack: RulePackWhere
  ) {
    penaltyShotStatuses(where: $where) {
      penaltyShotStatusId
      name
      code
    }
    rulePacks(where: $whereRulePack) {
      name
    }
  }
`

const CREATE_PENALTY_SHOT_STATUS = gql`
  mutation createPenaltyShotStatus($input: [PenaltyShotStatusCreateInput!]!) {
    createPenaltyShotStatuses(input: $input) {
      penaltyShotStatuses {
        penaltyShotStatusId
        name
        code
      }
    }
  }
`

const UPDATE_PENALTY_SHOT_STATUS = gql`
  mutation updatePenaltyShotStatus(
    $where: PenaltyShotStatusWhere
    $update: PenaltyShotStatusUpdateInput
  ) {
    updatePenaltyShotStatuses(where: $where, update: $update) {
      penaltyShotStatuses {
        penaltyShotStatusId
        name
        code
      }
    }
  }
`

const DELETE_PENALTY_SHOT_STATUS = gql`
  mutation deletePenaltyShotStatus($where: PenaltyShotStatusWhere) {
    deletePenaltyShotStatuses(where: $where) {
      nodesDeleted
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  code: string().required('Code is required'),
})

const PenaltyShotStatuses = props => {
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
  ] = useLazyQuery(GET_PENALTY_SHOT_STATUSES, {
    variables: {
      where: { rulePack: { rulePackId } },
      whereRulePack: { rulePackId },
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

  const [deletePenaltyShotStatus, { loading: mutationLoadingRemove }] =
    useMutation(DELETE_PENALTY_SHOT_STATUS, {
      update(cache) {
        try {
          const deleted = formData.current
          const queryResult = cache.readQuery({
            query: GET_PENALTY_SHOT_STATUSES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })
          const updatedData = queryResult.penaltyShotStatuses.filter(
            p => p.penaltyShotStatusId !== deleted.penaltyShotStatusId
          )

          const updatedResult = {
            penaltyShotStatuses: updatedData,
          }
          cache.writeQuery({
            query: GET_PENALTY_SHOT_STATUSES,
            data: updatedResult,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar(`PenaltyShotStatus was deleted!`, {
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

  const rulePackPenaltyShotStatusesColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'code',
        headerName: 'Code',
        width: 100,
      },
      {
        field: 'penaltyShotStatusId',
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
                'Do you really want to delete this penalty shot status?'
              }
              dialogDescription={
                'Penalty shot status will be completely delete'
              }
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() => {
                formData.current = params.row
                deletePenaltyShotStatus({
                  variables: {
                    where: {
                      penaltyShotStatusId: params.row.penaltyShotStatusId,
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
        aria-controls="penalty-shot-statuses-content"
        id="penalty-shot-statuses-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Penalty Shot Status
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
                columns={rulePackPenaltyShotStatusesColumns}
                rows={setIdFromEntityId(
                  queryData?.penaltyShotStatuses,
                  'penaltyShotStatusId'
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
        rulePack={queryData?.rulePack}
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

  const [createPenaltyShotStatus, { loading: mutationLoadingCreate }] =
    useMutation(CREATE_PENALTY_SHOT_STATUS, {
      update(cache, { data: { createPenaltyShotStatuses } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PENALTY_SHOT_STATUSES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })
          const newItem = createPenaltyShotStatuses?.penaltyShotStatuses?.[0]

          const existingData = queryResult?.penaltyShotStatuses
          const updatedData = [newItem, ...existingData]
          const updatedResult = {
            penaltyShotStatuses: updatedData,
          }
          cache.writeQuery({
            query: GET_PENALTY_SHOT_STATUSES,
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

  const [updatePenaltyShotStatus, { loading: mutationLoadingUpdate }] =
    useMutation(UPDATE_PENALTY_SHOT_STATUS, {
      update(cache, { data: { updatePenaltyShotStatuses } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PENALTY_SHOT_STATUSES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })

          const newItem = updatePenaltyShotStatuses?.penaltyShotStatuses?.[0]

          const existingData = queryResult?.penaltyShotStatuses
          const updatedData = existingData?.map(ed =>
            ed.penaltyShotStatusId === newItem.penaltyShotStatusId
              ? newItem
              : ed
          )
          const updatedResult = {
            penaltyShotStatuses: updatedData,
          }
          cache.writeQuery({
            query: GET_PENALTY_SHOT_STATUSES,
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
        const { name, code } = dataToCheck
        data?.penaltyShotStatusId
          ? updatePenaltyShotStatus({
              variables: {
                where: {
                  penaltyShotStatusId: data?.penaltyShotStatusId,
                },
                update: {
                  name,
                  code,
                },
              },
            })
          : createPenaltyShotStatus({
              variables: {
                input: {
                  name,
                  code,

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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={classes.form}
        noValidate
        autoComplete="off"
      >
        <DialogTitle id="alert-dialog-title">{`Add new penalty shot status to ${rulePack?.name}`}</DialogTitle>
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
                      defaultValue={data?.code || ''}
                      name="code"
                      label="Code"
                      required
                      fullWidth
                      variant="standard"
                      error={errors?.code}
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
}

PenaltyShotStatuses.propTypes = {
  rulePackId: PropTypes.string,
}

export { PenaltyShotStatuses }
