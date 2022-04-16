import React, { useCallback, useState, useMemo, useRef } from 'react'
import {
  gql,
  MutationFunction,
  useLazyQuery,
  useMutation,
} from '@apollo/client'

import { useSnackbar } from 'notistack'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { object, string, number } from 'yup'

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

import Grid from '@mui/material/Grid'
import LoadingButton from '@mui/lab/LoadingButton'
import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

import { RHFInput, Error, Loader } from 'components'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId, getXGridValueFromArray } from 'utils'
import { GoalType, GoalSubType } from 'utils/types'

const GET_GOAL_TYPES = gql`
  query getRulePack($where: GoalTypeWhere) {
    goalTypes(where: $where) {
      goalTypeId
      name
      code
      priority
      subTypes {
        goalSubTypeId
        name
        code
        priority
      }
    }
  }
`

const CREATE_GOAL_TYPE = gql`
  mutation createGoalType($input: [GoalTypeCreateInput!]!) {
    createGoalTypes(input: $input) {
      goalTypes {
        goalTypeId
        name
        code
        priority
        subTypes {
          goalSubTypeId
          name
          code
          priority
        }
      }
    }
  }
`

const UPDATE_GOAL_TYPE = gql`
  mutation updateGoalType(
    $where: GoalTypeWhere
    $update: GoalTypeUpdateInput
    $create: GoalTypeRelationInput
  ) {
    updateGoalTypes(where: $where, update: $update, create: $create) {
      goalTypes {
        goalTypeId
        name
        code
        priority
        subTypes {
          goalSubTypeId
          name
          code
          priority
        }
      }
    }
  }
`

const DELETE_GOAL_TYPE = gql`
  mutation deleteGoalType($where: GoalTypeWhere) {
    deleteGoalTypes(where: $where) {
      nodesDeleted
    }
  }
`

const DELETE_GOAL_SUB_TYPE = gql`
  mutation deleteGoalSubType($where: GoalSubTypeWhere) {
    deleteGoalSubTypes(where: $where) {
      nodesDeleted
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  code: string().required('Code is required'),
  priority: number().integer().positive(),
})
type TRelations = {
  rulePackId: string
}

type TQueryTypeData = {
  goalTypes: GoalType[]
}

type TQueryTypeVars = {
  where: {
    rulePack: {
      rulePackId: string
    }
  }
}

const GoalTypes: React.FC<TRelations> = props => {
  const { rulePackId } = props

  const classes = useStyles()
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef<GoalType | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery<TQueryTypeData, TQueryTypeVars>(GET_GOAL_TYPES, {
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

  const [deleteGoalType, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_GOAL_TYPE,
    {
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_GOAL_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const updatedData = queryResult?.goalTypes?.filter(
            p => p.goalTypeId !== formData.current?.goalTypeId
          )

          const updatedResult = {
            goalTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_GOAL_TYPES,
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
        enqueueSnackbar(`GoalType was deleted!`, {
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

  const rulePackGoalTypesColumns = useMemo<GridColumns>(
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
        field: 'priority',
        headerName: 'Priority',
        width: 100,
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
        field: 'goalTypeId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Button
              onClick={() => handleOpenDialog(params.value)}
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
              dialogTitle={'Do you really want to delete this goal type?'}
              dialogDescription={'Goal type will be completely delete'}
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() => {
                formData.current = params.row
                deleteGoalType({
                  variables: {
                    where: { goalTypeId: params.row.goalTypeId },
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
        aria-controls="goal-types-content"
        id="goal-types-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Goal Types
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
                columns={rulePackGoalTypesColumns}
                rows={setIdFromEntityId(queryData?.goalTypes, 'goalTypeId')}
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
          queryData?.goalTypes?.find(
            gt => gt.goalTypeId === formData.current?.goalTypeId
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
  data: GoalType | null
}

const FormDialog: React.FC<TFormDialog> = React.memo(props => {
  const { rulePackId, openDialog, handleCloseDialog, data } = props
  const [newSubType, setNewSubType] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [createGoalType, { loading: mutationLoadingCreate }] = useMutation(
    CREATE_GOAL_TYPE,
    {
      update(cache, { data: { createGoalTypes } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_GOAL_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const newItem = createGoalTypes?.goalTypes?.[0]

          const existingData = queryResult?.goalTypes || []
          const updatedData = [newItem, ...existingData]
          const updatedResult = {
            goalTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_GOAL_TYPES,
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

  const [updateGoalType, { loading: mutationLoadingUpdate }] = useMutation(
    UPDATE_GOAL_TYPE,
    {
      update(cache, { data: { updateGoalTypes } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_GOAL_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })

          const newItem = updateGoalTypes?.goalTypes?.[0]

          const existingData = queryResult?.goalTypes || []
          const updatedData = existingData?.map(ed =>
            ed.goalTypeId === newItem.goalTypeId ? newItem : ed
          )
          const updatedResult = {
            goalTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_GOAL_TYPES,
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
        const { name, code, priority } = dataToCheck
        data?.goalTypeId
          ? updateGoalType({
              variables: {
                where: {
                  goalTypeId: data?.goalTypeId,
                },
                update: {
                  name,
                  code,
                  priority: `${priority}`,
                },
              },
            })
          : createGoalType({
              variables: {
                input: {
                  name,
                  code,
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
      onClose={() => {
        handleCloseDialog()
        setNewSubType(false)
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{`Add new goal type`}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4} md={4} lg={4}>
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
              key={st.goalSubTypeId}
              rulePackId={rulePackId}
              goalTypeId={data?.goalTypeId}
              data={st}
              updateGoalType={updateGoalType}
              mutationLoadingUpdate={mutationLoadingUpdate}
            />
          ))}
        </div>
        <div style={{ margin: '2rem 0' }}>
          {data?.goalTypeId && newSubType ? (
            <SubType
              rulePackId={rulePackId}
              goalTypeId={data?.goalTypeId}
              data={{
                goalSubTypeId: '',
                name: '',
                code: '',
                priority: 0,
              }}
              updateGoalType={updateGoalType}
              mutationLoadingUpdate={mutationLoadingUpdate}
            />
          ) : (
            data?.goalTypeId && (
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
            setNewSubType(false)
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
  goalTypeId: string
  mutationLoadingUpdate: boolean
  updateGoalType: MutationFunction
  data: GoalSubType | null
}

const SubType: React.FC<TSubFormDialog> = React.memo(props => {
  const {
    rulePackId,
    goalTypeId,
    data,
    updateGoalType,
    mutationLoadingUpdate,
  } = props
  const { enqueueSnackbar } = useSnackbar()

  const goalSubTypeIdDelete = React.useRef(data?.goalSubTypeId)

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [deleteGoalSubType, { loading: mutationLoadingDeleteGoalSubType }] =
    useMutation(DELETE_GOAL_SUB_TYPE, {
      variables: {
        where: { goalSubTypeId: data?.goalSubTypeId },
      },
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_GOAL_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })

          const goalType = queryResult?.goalTypes?.find(
            gt => gt.goalTypeId === goalTypeId
          )

          const updatedData = goalType?.subTypes?.filter(
            p => p.goalSubTypeId !== goalSubTypeIdDelete.current
          )

          const updatedResult = {
            goalTypes: [
              ...(queryResult?.goalTypes?.filter(
                gt => gt.goalTypeId !== goalTypeId
              ) || []),
              {
                ...goalType,
                subTypes: updatedData,
              },
            ],
          }

          cache.writeQuery({
            query: GET_GOAL_TYPES,
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
        enqueueSnackbar(`GoalSubType was deleted!`, {
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

        data?.goalSubTypeId
          ? updateGoalType({
              variables: {
                where: {
                  goalTypeId,
                },
                update: {
                  subTypes: {
                    where: {
                      node: { goalSubTypeId: data?.goalSubTypeId },
                    },
                    update: {
                      node: {
                        name,
                        code,
                        priority: `${priority}`,
                      },
                    },
                  },
                },
              },
            })
          : updateGoalType({
              variables: {
                where: {
                  goalTypeId,
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
    [goalTypeId, data]
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
          {data?.goalSubTypeId && (
            <LoadingButton
              onClick={() => {
                deleteGoalSubType()
              }}
              type="button"
              loading={mutationLoadingDeleteGoalSubType}
            >
              {mutationLoadingDeleteGoalSubType ? 'Deleting...' : 'Delete'}
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

export { GoalTypes }
