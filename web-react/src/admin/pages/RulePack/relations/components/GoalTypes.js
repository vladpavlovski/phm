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
import { setIdFromEntityId, getXGridValueFromArray } from '../../../../../utils'

const GET_GOAL_TYPES = gql`
  query getRulePack($where: GoalTypeWhere, $whereRulePack: RulePackWhere) {
    goalTypes(where: $where) {
      goalTypeId
      name
      code
      subTypes {
        goalSubTypeId
        name
        code
      }
    }
    rulePacks(where: $whereRulePack) {
      name
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
        subTypes {
          goalSubTypeId
          name
          code
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
        subTypes {
          goalSubTypeId
          name
          code
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
})

const GoalTypes = props => {
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
  ] = useLazyQuery(GET_GOAL_TYPES, {
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

  const [deleteGoalType, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_GOAL_TYPE,
    {
      update(cache) {
        try {
          const deleted = formData.current
          const queryResult = cache.readQuery({
            query: GET_GOAL_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })
          const updatedData = queryResult.goalTypes.filter(
            p => p.goalTypeId !== deleted.goalTypeId
          )

          const updatedResult = {
            goalTypes: updatedData,
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

  const rulePackGoalTypesColumns = useMemo(
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
              size="small"
              startIcon={<DeleteForeverIcon />}
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
        rulePack={queryData?.rulePack}
        rulePackId={rulePackId}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        data={queryData?.goalTypes?.find(
          gt => gt.goalTypeId === formData.current
        )}
      />
    </Accordion>
  )
}

const FormDialog = props => {
  const { rulePack, rulePackId, openDialog, handleCloseDialog, data } = props
  const [newSubType, setNewSubType] = useState(false)
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [createGoalType, { loading: mutationLoadingCreate }] = useMutation(
    CREATE_GOAL_TYPE,
    {
      update(cache, { data: { createGoalTypes } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_GOAL_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })
          const newItem = createGoalTypes?.goalTypes?.[0]

          const existingData = queryResult?.goalTypes
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
          const queryResult = cache.readQuery({
            query: GET_GOAL_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })

          const newItem = updateGoalTypes?.goalTypes?.[0]

          const existingData = queryResult?.goalTypes
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
        const { name, code } = dataToCheck

        data?.goalTypeId
          ? updateGoalType({
              variables: {
                where: {
                  goalTypeId: data?.goalTypeId,
                },
                update: {
                  name,
                  code,
                },
              },
            })
          : createGoalType({
              variables: {
                input: {
                  name,
                  code,

                  rulePack: {
                    connect: {
                      where: {
                        rulePackId,
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
      <DialogTitle id="alert-dialog-title">{`Add new goal type to ${rulePack?.name}`}</DialogTitle>
      <DialogContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={classes.form}
          noValidate
          autoComplete="off"
        >
          <Container>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={5} md={5} lg={5}>
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
                  <Grid item xs={12} sm={5} md={5} lg={5}>
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
        </form>

        <div style={{ margin: '2rem 0' }}>
          {data?.subTypes?.map(st => (
            <SubType
              key={st.goalSubTypeId}
              rulePack={rulePack}
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
              rulePack={rulePack}
              rulePackId={rulePackId}
              goalTypeId={data?.goalTypeId}
              data={{
                goalSubTypeId: null,
                name: '',
                code: '',
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
}

const SubType = props => {
  const {
    rulePackId,
    goalTypeId,
    data,
    updateGoalType,
    mutationLoadingUpdate,
  } = props
  const classes = useStyles()
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
          const queryResult = cache.readQuery({
            query: GET_GOAL_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })

          const goalType = queryResult.goalTypes.find(
            gt => gt.goalTypeId === goalTypeId
          )

          const updatedData = goalType.subTypes.filter(
            p => p.goalSubTypeId !== goalSubTypeIdDelete.current
          )

          const updatedResult = {
            goalTypes: [
              ...queryResult.goalTypes.filter(
                gt => gt.goalTypeId !== goalTypeId
              ),
              {
                ...goalType,
                subTypes: updatedData,
              },
            ],

            rulePacks: queryResult?.rulePacks,
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
        const { name, code } = dataToCheck

        data?.goalSubTypeId
          ? updateGoalType({
              variables: {
                where: {
                  goalTypeId,
                },
                update: {
                  subTypes: {
                    where: {
                      goalSubTypeId: data?.goalSubTypeId,
                    },
                    update: {
                      name,
                      code,
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
                  subTypes: { node: { name, code } },
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
    <Container>
      <form
        onSubmit={null}
        className={classes.form}
        noValidate
        autoComplete="off"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={12} lg={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={5} md={5} lg={5}>
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
              <Grid item xs={12} sm={5} md={5} lg={5}>
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

              <Grid item xs={12} sm={1} md={1} lg={1}>
                {data?.goalSubTypeId && (
                  <LoadingButton
                    onClick={() => {
                      deleteGoalSubType()
                    }}
                    type="button"
                    loading={mutationLoadingDeleteGoalSubType}
                  >
                    {mutationLoadingDeleteGoalSubType
                      ? 'Deleting...'
                      : 'Delete'}
                  </LoadingButton>
                )}
              </Grid>

              <Grid item xs={12} sm={1} md={1} lg={1}>
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
          </Grid>
        </Grid>
      </form>
    </Container>
  )
}

GoalTypes.propTypes = {
  rulePackId: PropTypes.string,
}

export { GoalTypes }
