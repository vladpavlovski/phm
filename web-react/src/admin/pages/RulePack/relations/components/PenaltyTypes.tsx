import { Error, Loader, RHFInput } from 'components'
import { useSnackbar } from 'notistack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getXGridValueFromArray, setIdFromEntityId, showTimeAsHms } from 'utils'
import { PenaltySubType, PenaltyType } from 'utils/types'
import { number, object, string } from 'yup'
import { gql, MutationFunction, useLazyQuery, useMutation } from '@apollo/client'
import { yupResolver } from '@hookform/resolvers/yup'
import CreateIcon from '@mui/icons-material/Create'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LoadingButton from '@mui/lab/LoadingButton'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { useStyles } from '../../../commonComponents/styled'

const GET_PENALTY_TYPES = gql`
  query getRulePack($where: PenaltyTypeWhere) {
    penaltyTypes(where: $where) {
      penaltyTypeId
      name
      code
      duration
      priority
      subTypes {
        penaltySubTypeId
        name
        code
        priority
      }
    }
  }
`

const CREATE_PENALTY_TYPE = gql`
  mutation createPenaltyType($input: [PenaltyTypeCreateInput!]!) {
    createPenaltyTypes(input: $input) {
      penaltyTypes {
        penaltyTypeId
        name
        code
        duration
        priority
        subTypes {
          penaltySubTypeId
          name
          code
          priority
        }
      }
    }
  }
`

const UPDATE_PENALTY_TYPE = gql`
  mutation updatePenaltyType(
    $where: PenaltyTypeWhere
    $update: PenaltyTypeUpdateInput
    $create: PenaltyTypeRelationInput
  ) {
    updatePenaltyTypes(where: $where, update: $update, create: $create) {
      penaltyTypes {
        penaltyTypeId
        name
        code
        duration
        priority
        subTypes {
          penaltySubTypeId
          name
          code
          priority
        }
      }
    }
  }
`

const DELETE_PENALTY_TYPE = gql`
  mutation deletePenaltyType($where: PenaltyTypeWhere) {
    deletePenaltyTypes(where: $where) {
      nodesDeleted
    }
  }
`

const DELETE_SHOT_SUB_TYPE = gql`
  mutation deletePenaltySubType($where: PenaltySubTypeWhere) {
    deletePenaltySubTypes(where: $where) {
      nodesDeleted
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  code: string().required('Code is required'),
  duration: number().positive().required('Duration is required'),
  priority: number().integer().positive(),
})

const schemaSubType = object().shape({
  name: string().required('Name is required'),
  code: string().required('Code is required'),
  priority: number().integer().positive(),
})
type TRelations = {
  rulePackId: string
}

type TQueryTypeData = {
  penaltyTypes: PenaltyType[]
}

type TQueryTypeVars = {
  where: {
    rulePack: {
      rulePackId: string
    }
  }
}

const PenaltyTypes: React.FC<TRelations> = props => {
  const { rulePackId } = props

  const classes = useStyles()
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef<PenaltyType | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery<TQueryTypeData, TQueryTypeVars>(GET_PENALTY_TYPES, {
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

  const [deletePenaltyType, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_PENALTY_TYPE,
    {
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_PENALTY_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const updatedData = queryResult?.penaltyTypes?.filter(
            p => p.penaltyTypeId !== formData.current?.penaltyTypeId
          )

          const updatedResult = {
            penaltyTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_PENALTY_TYPES,
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
        enqueueSnackbar(`Penalty type was deleted!`, {
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

  const rulePackPenaltyTypesColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'code',
        headerName: 'Code',
        width: 120,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 100,
      },
      {
        field: 'duration',
        headerName: 'Duration',
        width: 150,
        valueFormatter: params => {
          return showTimeAsHms(params.value as number)
        },
      },
      {
        field: 'subTypes',
        headerName: 'Sub Types',
        width: 300,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.subTypes, 'name')
        },
      },
      {
        field: 'penaltyTypeId',
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
              dialogTitle={'Do you really want to delete this penalty type?'}
              dialogDescription={'Penalty type will be completely delete'}
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() => {
                formData.current = params.row
                deletePenaltyType({
                  variables: {
                    where: { penaltyTypeId: params.row.penaltyTypeId },
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
        aria-controls="penalty-types-content"
        id="penalty-types-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Penalty Types
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
                  onClick={() => {
                    handleOpenDialog(null)
                  }}
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
                columns={rulePackPenaltyTypesColumns}
                rows={setIdFromEntityId(
                  queryData?.penaltyTypes,
                  'penaltyTypeId'
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
        data={
          queryData?.penaltyTypes?.find(
            gt => gt.penaltyTypeId === formData.current?.penaltyTypeId
          ) || null
        }
      />
    </Accordion>
  )
}

type TFormDialog = {
  rulePackId: string
  openDialog: boolean
  handleCloseDialog: () => void
  data: PenaltyType | null
}

const FormDialog: React.FC<TFormDialog> = React.memo(props => {
  const { rulePackId, openDialog, handleCloseDialog, data } = props
  const [newSubType, setNewSubType] = useState(false)

  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [createPenaltyType, { loading: mutationLoadingCreate }] = useMutation(
    CREATE_PENALTY_TYPE,
    {
      update(cache, { data: { createPenaltyTypes } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_PENALTY_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const newItem = createPenaltyTypes?.penaltyTypes?.[0]

          const existingData = queryResult?.penaltyTypes || []
          const updatedData = [newItem, ...existingData]
          const updatedResult = {
            penaltyTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_PENALTY_TYPES,
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
        enqueueSnackbar('Penalty type saved!', { variant: 'success' })
        handleCloseDialog()
      },
      onError: error => {
        enqueueSnackbar(`Error: ${error}`, {
          variant: 'error',
        })
      },
    }
  )

  const [updatePenaltyType, { loading: mutationLoadingUpdate }] = useMutation(
    UPDATE_PENALTY_TYPE,
    {
      update(cache, { data: { updatePenaltyTypes } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_PENALTY_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })

          const newItem = updatePenaltyTypes?.penaltyTypes?.[0]

          const existingData = queryResult?.penaltyTypes || []
          const updatedData = existingData?.map(ed =>
            ed.penaltyTypeId === newItem.penaltyTypeId ? newItem : ed
          )
          const updatedResult = {
            penaltyTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_PENALTY_TYPES,
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
        enqueueSnackbar('Penalty type updated!', { variant: 'success' })
        handleCloseDialog()
        setNewSubType(false)
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
        const { name, code, duration, priority } = dataToCheck

        data?.penaltyTypeId
          ? updatePenaltyType({
              variables: {
                where: {
                  penaltyTypeId: data?.penaltyTypeId,
                },
                update: {
                  name,
                  code,
                  duration: parseFloat(duration),
                  priority: `${priority}`,
                },
              },
            })
          : createPenaltyType({
              variables: {
                input: {
                  name,
                  code,
                  duration: parseFloat(duration),
                  priority: `${priority}`,
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
      <DialogTitle id="alert-dialog-title">{`Add new penalty type`}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3} md={3} lg={3}>
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
            <Grid item xs={12} sm={3} md={3} lg={3}>
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
            <Grid item xs={12} sm={3} md={3} lg={3}>
              <RHFInput
                control={control}
                defaultValue={data?.duration || ''}
                name="duration"
                label="Duration in minutes"
                required
                fullWidth
                variant="standard"
                error={errors?.duration}
              />
            </Grid>
            <Grid item xs={12} sm={3} md={3} lg={3}>
              <RHFInput
                control={control}
                defaultValue={data?.priority}
                name="priority"
                label="Priority"
                fullWidth
                variant="standard"
                error={errors?.priority}
              />
            </Grid>
          </Grid>
        </form>

        <div style={{ margin: '2rem 0' }}>
          {data?.subTypes?.map(st => (
            <SubType
              key={st.penaltySubTypeId}
              rulePackId={rulePackId}
              penaltyTypeId={data?.penaltyTypeId}
              data={st}
              updatePenaltyType={updatePenaltyType}
              mutationLoadingUpdate={mutationLoadingUpdate}
            />
          ))}
        </div>
        <div style={{ margin: '2rem 0' }}>
          {data?.penaltyTypeId && newSubType ? (
            <SubType
              rulePackId={rulePackId}
              penaltyTypeId={data?.penaltyTypeId}
              data={{
                penaltySubTypeId: '',
                name: '',
                code: '',
                priority: 0,
                duration: 0,
              }}
              updatePenaltyType={updatePenaltyType}
              mutationLoadingUpdate={mutationLoadingUpdate}
            />
          ) : (
            data?.penaltyTypeId && (
              <Button
                type="button"
                variant="contained"
                onClick={() => {
                  setNewSubType(true)
                }}
              >
                Add new subType
              </Button>
            )
          )}
        </div>
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
          type="button"
          onClick={handleSubmit(onSubmit)}
          loading={mutationLoadingCreate || mutationLoadingUpdate}
        >
          {mutationLoadingCreate || mutationLoadingUpdate
            ? 'Saving...'
            : 'Save'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
})

type TSubFormDialog = {
  rulePackId: string
  penaltyTypeId: string
  mutationLoadingUpdate: boolean
  updatePenaltyType: MutationFunction
  data: PenaltySubType | null
}

const SubType: React.FC<TSubFormDialog> = React.memo(props => {
  const {
    rulePackId,
    penaltyTypeId,
    data,
    updatePenaltyType,
    mutationLoadingUpdate,
  } = props

  const { enqueueSnackbar } = useSnackbar()

  const penaltySubTypeIdDelete = React.useRef(data?.penaltySubTypeId)

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schemaSubType),
  })

  const [
    deletePenaltySubType,
    { loading: mutationLoadingDeletePenaltySubType },
  ] = useMutation(DELETE_SHOT_SUB_TYPE, {
    variables: {
      where: { penaltySubTypeId: data?.penaltySubTypeId },
    },
    update(cache) {
      try {
        const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
          query: GET_PENALTY_TYPES,
          variables: {
            where: { rulePack: { rulePackId } },
          },
        })

        const penaltyType = queryResult?.penaltyTypes?.find(
          gt => gt.penaltyTypeId === penaltyTypeId
        )

        const updatedData = penaltyType?.subTypes?.filter(
          p => p.penaltySubTypeId !== penaltySubTypeIdDelete.current
        )

        const updatedResult = {
          penaltyTypes: [
            ...(queryResult?.penaltyTypes?.filter(
              gt => gt.penaltyTypeId !== penaltyTypeId
            ) || []),
            {
              ...penaltyType,
              subTypes: updatedData,
            },
          ],
        }

        cache.writeQuery({
          query: GET_PENALTY_TYPES,
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
      enqueueSnackbar(`PenaltySubType was deleted!`, {
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

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { name, code, priority } = dataToCheck

        data?.penaltySubTypeId
          ? updatePenaltyType({
              variables: {
                where: {
                  penaltyTypeId,
                },
                update: {
                  subTypes: {
                    where: {
                      node: { penaltySubTypeId: data?.penaltySubTypeId },
                    },
                    update: {
                      node: { name, code, priority: `${priority}` },
                    },
                  },
                },
              },
            })
          : updatePenaltyType({
              variables: {
                where: {
                  penaltyTypeId,
                },

                create: {
                  subTypes: { node: { name, code, priority: `${priority}` } },
                },
              },
            })
      } catch (error) {
        console.error(error)
      }
    },
    [penaltyTypeId, data]
  )

  return (
    <form noValidate autoComplete="off">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4} md={4} lg={4}>
          <RHFInput
            control={control}
            defaultValue={data?.name || ''}
            name="name"
            label="SubType Name"
            required
            fullWidth
            variant="standard"
            error={errors?.name}
          />
        </Grid>
        <Grid item xs={12} sm={3} md={3} lg={3}>
          <RHFInput
            control={control}
            defaultValue={data?.code || ''}
            name="code"
            label="SubType Code"
            required
            fullWidth
            variant="standard"
            error={errors?.code}
          />
        </Grid>
        <Grid item xs={12} sm={3} md={3} lg={3}>
          <RHFInput
            control={control}
            defaultValue={data?.priority}
            name="priority"
            label="Priority"
            fullWidth
            variant="standard"
            error={errors?.priority}
          />
        </Grid>

        <Grid item xs={12} sm={2} md={2} lg={2}>
          {data?.penaltySubTypeId && (
            <LoadingButton
              onClick={() => {
                deletePenaltySubType()
              }}
              type="button"
              loading={mutationLoadingDeletePenaltySubType}
            >
              {mutationLoadingDeletePenaltySubType ? 'Deleting...' : 'Delete'}
            </LoadingButton>
          )}
          <LoadingButton
            onClick={() => {
              handleSubmit(onSubmit)()
            }}
            type="button"
            loading={mutationLoadingUpdate}
          >
            {mutationLoadingUpdate ? 'Saving...' : 'Save'}
          </LoadingButton>
        </Grid>
      </Grid>
    </form>
  )
})

export { PenaltyTypes }
