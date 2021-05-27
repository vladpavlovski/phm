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
import {
  setIdFromEntityId,
  checkId,
  getXGridValueFromArray,
} from '../../../../../utils'

const GET_GOAL_TYPES = gql`
  query getRulePack($rulePackId: ID) {
    rulePack: RulePack(rulePackId: $rulePackId) {
      rulePackId
      name
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

const MERGE_RULEPACK_GOAL_TYPE = gql`
  mutation mergeRulePackGoalType(
    $rulePackId: ID!
    $goalTypeId: ID!
    $name: String
    $code: String
  ) {
    goalType: MergeGoalType(goalTypeId: $goalTypeId, name: $name, code: $code) {
      goalTypeId
      name
    }
    goalTypeRulePack: MergeGoalTypeRulePack(
      from: { rulePackId: $rulePackId }
      to: { goalTypeId: $goalTypeId }
    ) {
      from {
        name
      }
      to {
        goalTypeId
        name
        code
      }
    }
  }
`

const DELETE_GOAL_TYPE = gql`
  mutation deleteGoalType($goalTypeId: ID!) {
    deleted: DeleteGoalType(goalTypeId: $goalTypeId) {
      goalTypeId
    }
  }
`

const MERGE_GOAL_TYPE_GOAL_SUB_TYPE = gql`
  mutation mergeRulePackGoalSubType(
    $goalTypeId: ID!
    $goalSubTypeId: ID!
    $name: String
    $code: String
  ) {
    goalSubType: MergeGoalSubType(
      goalSubTypeId: $goalSubTypeId
      name: $name
      code: $code
    ) {
      goalSubTypeId
      name
    }
    goalSubTypeGoalType: MergeGoalSubTypeGoalType(
      from: { goalTypeId: $goalTypeId }
      to: { goalSubTypeId: $goalSubTypeId }
    ) {
      from {
        name
      }
      to {
        goalSubTypeId
        name
        code
      }
    }
  }
`

const DELETE_GOAL_SUB_TYPE = gql`
  mutation deleteGoalSubType($goalSubTypeId: ID!) {
    deleted: DeleteGoalSubType(goalSubTypeId: $goalSubTypeId) {
      goalSubTypeId
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

  const [deleteGoalType, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_GOAL_TYPE,
    {
      update(cache, { data: { deleted } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_GOAL_TYPES,
            variables: {
              rulePackId,
            },
          })
          const updatedData = queryResult.rulePack[0].goalTypes.filter(
            p => p.goalTypeId !== deleted.goalTypeId
          )

          const updatedResult = {
            rulePack: [
              {
                ...queryResult.rulePack[0],
                goalTypes: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GOAL_TYPES,
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
              onDialogClosePositive={() =>
                deleteGoalType({
                  variables: {
                    goalTypeId: params.row.goalTypeId,
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
                rows={setIdFromEntityId(rulePack.goalTypes, 'goalTypeId')}
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
        data={rulePack?.goalTypes?.find(
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

  const [
    mergeRulePackGoalType,
    { loading: loadingMergeGoalType },
  ] = useMutation(MERGE_RULEPACK_GOAL_TYPE, {
    update(cache, { data: { goalTypeRulePack } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_GOAL_TYPES,
          variables: {
            rulePackId,
          },
        })

        const existingData = queryResult.rulePack[0].goalTypes
        const newItem = goalTypeRulePack.to
        let updatedData = []
        if (existingData.find(ed => ed.goalTypeId === newItem.goalTypeId)) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.goalTypeId === newItem.goalTypeId ? newItem : ed
          )
        } else {
          // add new item if item not in array
          updatedData = [newItem, ...existingData]
        }

        const updatedResult = {
          rulePack: [
            {
              ...queryResult.rulePack[0],
              goalTypes: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_GOAL_TYPES,
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
        `${data.goalTypeRulePack.to.name} added to ${rulePack.name}!`,
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
        const { name, code } = dataToCheck

        mergeRulePackGoalType({
          variables: {
            rulePackId,
            name,
            code,
            goalTypeId: data?.goalTypeId || uuidv4(),
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
              setNewSubType={setNewSubType}
              data={st}
            />
          ))}
        </div>
        <div style={{ margin: '2rem 0' }}>
          {data?.goalTypeId && newSubType ? (
            <SubType
              rulePack={rulePack}
              rulePackId={rulePackId}
              goalTypeId={data?.goalTypeId}
              setNewSubType={setNewSubType}
              data={{
                goalSubTypeId: null,
                name: '',
                code: '',
              }}
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
          loading={loadingMergeGoalType}
        >
          {loadingMergeGoalType ? 'Saving...' : 'Save'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

const SubType = props => {
  const { rulePack, rulePackId, goalTypeId, data, setNewSubType } = props
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [
    mergeGoalTypeGoalSubType,
    { loading: loadingMergeGoalSubType },
  ] = useMutation(MERGE_GOAL_TYPE_GOAL_SUB_TYPE, {
    update(cache, { data: { goalSubTypeGoalType } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_GOAL_TYPES,
          variables: {
            rulePackId,
          },
        })

        const goalType = queryResult.rulePack[0].goalTypes.find(
          gt => gt.goalTypeId === goalTypeId
        )
        const existingData = goalType.subTypes
        const newItem = goalSubTypeGoalType.to

        let updatedData = []
        if (
          existingData.find(ed => ed.goalSubTypeId === newItem.goalSubTypeId)
        ) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.goalSubTypeId === newItem.goalSubTypeId ? newItem : ed
          )
        } else {
          // add new item if item not in array
          updatedData = [...existingData, newItem]
        }

        const updatedResult = {
          rulePack: [
            {
              ...queryResult.rulePack[0],
              goalTypes: [
                ...queryResult.rulePack[0].goalTypes.filter(
                  gt => gt.goalTypeId !== goalTypeId
                ),
                { ...goalType, subTypes: updatedData },
              ],
            },
          ],
        }
        cache.writeQuery({
          query: GET_GOAL_TYPES,
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
        `${data.goalSubTypeGoalType.to.name} added to ${rulePack.name}!`,
        {
          variant: 'success',
        }
      )
      setNewSubType(false)
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const [
    deleteGoalSubType,
    { loading: mutationLoadingDeleteGoalSubType },
  ] = useMutation(DELETE_GOAL_SUB_TYPE, {
    variables: {
      goalSubTypeId: data?.goalSubTypeId,
    },
    update(cache, { data: { deleted } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_GOAL_TYPES,
          variables: {
            rulePackId,
          },
        })

        const goalType = queryResult.rulePack[0].goalTypes.find(
          gt => gt.goalTypeId === goalTypeId
        )

        const updatedData = goalType.subTypes.filter(
          p => p.goalSubTypeId !== deleted.goalSubTypeId
        )

        const updatedResult = {
          rulePack: [
            {
              ...queryResult.rulePack[0],
              goalTypes: [
                ...queryResult.rulePack[0].goalTypes.filter(
                  gt => gt.goalTypeId !== goalTypeId
                ),
                {
                  ...goalType,
                  subTypes: updatedData,
                },
              ],
            },
          ],
        }
        cache.writeQuery({
          query: GET_GOAL_TYPES,
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

        mergeGoalTypeGoalSubType({
          variables: {
            goalTypeId,
            name,
            code,
            goalSubTypeId: checkId(data?.goalSubTypeId || 'new'),
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
                  loading={loadingMergeGoalSubType}
                >
                  {loadingMergeGoalSubType ? 'Saving...' : 'Save'}
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
