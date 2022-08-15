import { Error, Loader, RHFInput } from 'components'
import { useSnackbar } from 'notistack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { setIdFromEntityId, showTimeAsMinutes } from 'utils'
import { Period } from 'utils/types'
import { number, object, string } from 'yup'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { yupResolver } from '@hookform/resolvers/yup'
import CreateIcon from '@mui/icons-material/Create'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LoadingButton from '@mui/lab/LoadingButton'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

const GET_PERIODS = gql`
  query getRulePack($where: PeriodWhere) {
    periods(where: $where) {
      periodId
      name
      code
      duration
      priority
    }
  }
`

const CREATE_PERIOD = gql`
  mutation createPeriod($input: [PeriodCreateInput!]!) {
    createPeriods(input: $input) {
      periods {
        periodId
        name
        code
        duration
        priority
      }
    }
  }
`

const UPDATE_PERIOD = gql`
  mutation updatePeriod($where: PeriodWhere, $update: PeriodUpdateInput) {
    updatePeriods(where: $where, update: $update) {
      periods {
        periodId
        name
        code
        duration
        priority
      }
    }
  }
`

const DELETE_PERIOD = gql`
  mutation deletePeriod($where: PeriodWhere) {
    deletePeriods(where: $where) {
      nodesDeleted
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  code: string(),
  duration: number().integer().positive().required('Duration is required'),
  priority: number().integer().positive().required('Priority is required'),
})

type TRelations = {
  rulePackId: string
}

type TQueryTypeData = {
  periods: Period[]
}

type TQueryTypeVars = {
  where: {
    rulePack: {
      rulePackId: string
    }
  }
}

const Periods: React.FC<TRelations> = props => {
  const { rulePackId } = props

  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef<Period | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery<TQueryTypeData, TQueryTypeVars>(GET_PERIODS, {
    variables: {
      where: { rulePack: { rulePackId } },
    },
    fetchPolicy: 'cache-and-network',
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

  const [deletePeriod, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_PERIOD,
    {
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_PERIODS,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const updatedData = queryResult?.periods?.filter(
            p => p.periodId !== formData.current?.periodId
          )

          const updatedResult = {
            periods: updatedData,
          }
          cache.writeQuery({
            query: GET_PERIODS,
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
        enqueueSnackbar(`Period was deleted!`, {
          variant: 'info',
        })
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const rulePackPeriodsColumns = useMemo<GridColumns>(
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
        field: 'duration',
        headerName: 'Duration',
        width: 120,
        valueFormatter: params => {
          return showTimeAsMinutes(params.value as number)
        },
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 100,
      },
      {
        field: 'periodId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Button
              onClick={() => handleOpenDialog(params.row)}
              variant={'outlined'}
              size="small"
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
              dialogTitle={'Do you really want to delete this period?'}
              dialogDescription={'Period will be completely delete'}
              dialogNegativeText={'No, keep period'}
              dialogPositiveText={'Yes, delete period'}
              onDialogClosePositive={() => {
                formData.current = params.row
                deletePeriod({
                  variables: {
                    where: { periodId: params.row.periodId },
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
        aria-controls="periods-content"
        id="periods-header"
      >
        <Typography>Periods</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {queryData && (
          <>
            <Toolbar
              disableGutters
              sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
            >
              <div />
              <div>
                <Button
                  onClick={handleOpenDialog}
                  variant={'outlined'}
                  size="small"
                  startIcon={<CreateIcon />}
                >
                  Create
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600, width: '100%' }}>
              <DataGridPro
                columns={rulePackPeriodsColumns}
                rows={setIdFromEntityId(queryData?.periods, 'periodId')}
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
  data: Period | null
}

const FormDialog: React.FC<TFormDialog> = props => {
  const { rulePackId, openDialog, handleCloseDialog, data } = props

  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [createPeriod, { loading: mutationLoadingCreate }] = useMutation(
    CREATE_PERIOD,
    {
      update(cache, { data: { createPeriods } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_PERIODS,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const newItem = createPeriods?.periods?.[0]

          const existingData = queryResult?.periods || []
          const updatedData = [newItem, ...existingData]
          const updatedResult = {
            periods: updatedData,
          }
          cache.writeQuery({
            query: GET_PERIODS,
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
    }
  )

  const [updatePeriod, { loading: mutationLoadingUpdate }] = useMutation(
    UPDATE_PERIOD,
    {
      update(cache, { data: { updatePeriods } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_PERIODS,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })

          const newItem = updatePeriods?.periods?.[0]

          const existingData = queryResult?.periods
          const updatedData = existingData?.map(ed =>
            ed.periodId === newItem.periodId ? newItem : ed
          )
          const updatedResult = {
            periods: updatedData,
          }
          cache.writeQuery({
            query: GET_PERIODS,
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
    }
  )

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { name, duration, code, priority } = dataToCheck
        data?.periodId
          ? updatePeriod({
              variables: {
                where: {
                  periodId: data?.periodId,
                },
                update: {
                  name,
                  code,
                  duration: duration || null,
                  priority: priority || null,
                },
              },
            })
          : createPeriod({
              variables: {
                input: {
                  name,
                  code,
                  duration: duration || null,
                  priority: priority || null,
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
        <DialogTitle id="alert-dialog-title">{`Add new period`}</DialogTitle>
        <DialogContent>
          <Container>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFInput
                      control={control}
                      defaultValue={data?.name}
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
                      defaultValue={data?.code}
                      name="code"
                      label="Code"
                      fullWidth
                      variant="standard"
                      error={errors?.code}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFInput
                      control={control}
                      defaultValue={data?.duration}
                      name="duration"
                      label="Duration in minutes"
                      required
                      fullWidth
                      variant="standard"
                      error={errors?.duration}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFInput
                      control={control}
                      defaultValue={data?.priority}
                      name="priority"
                      label="Priority"
                      required
                      fullWidth
                      variant="standard"
                      error={errors?.priority}
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

export { Periods }
