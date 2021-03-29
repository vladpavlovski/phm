import React, { useCallback, useState, useMemo, useRef } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { v4 as uuidv4 } from 'uuid'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { object, string, number } from 'yup'

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
  showTimeAsMinutes,
  getXGridValueFromArray,
  checkId,
} from '../../../../../utils'

const GET_PENALTY_TYPES = gql`
  query getRulePack($rulePackId: ID) {
    rulePack: RulePack(rulePackId: $rulePackId) {
      rulePackId
      name
      penaltyTypes {
        penaltyTypeId
        name
        code
        duration
        subTypes {
          penaltySubTypeId
          name
          code
        }
      }
    }
  }
`

const MERGE_RULEPACK_PENALTY_TYPE = gql`
  mutation mergeRulePackPenaltyType(
    $rulePackId: ID!
    $penaltyTypeId: ID!
    $name: String
    $code: String
    $duration: Int
  ) {
    penaltyType: MergePenaltyType(
      penaltyTypeId: $penaltyTypeId
      name: $name
      code: $code
      duration: $duration
    ) {
      penaltyTypeId
      name
    }
    penaltyTypeRulePack: MergePenaltyTypeRulePack(
      from: { rulePackId: $rulePackId }
      to: { penaltyTypeId: $penaltyTypeId }
    ) {
      from {
        name
      }
      to {
        penaltyTypeId
        name
        code
        duration
      }
    }
  }
`

const DELETE_PENALTY_TYPE = gql`
  mutation deletePenaltyType($penaltyTypeId: ID!) {
    deleted: DeletePenaltyType(penaltyTypeId: $penaltyTypeId) {
      penaltyTypeId
    }
  }
`

const MERGE_PENALTY_TYPE_PENALTY_SUB_TYPE = gql`
  mutation mergeRulePackPenaltySubType(
    $penaltyTypeId: ID!
    $penaltySubTypeId: ID!
    $name: String
    $code: String
  ) {
    penaltySubType: MergePenaltySubType(
      penaltySubTypeId: $penaltySubTypeId
      name: $name
      code: $code
    ) {
      penaltySubTypeId
      name
    }
    penaltySubTypePenaltyType: MergePenaltySubTypePenaltyType(
      from: { penaltyTypeId: $penaltyTypeId }
      to: { penaltySubTypeId: $penaltySubTypeId }
    ) {
      from {
        name
      }
      to {
        penaltySubTypeId
        name
        code
      }
    }
  }
`

const DELETE_PENALTY_SUB_TYPE = gql`
  mutation deletePenaltySubType($penaltySubTypeId: ID!) {
    deleted: DeletePenaltySubType(penaltySubTypeId: $penaltySubTypeId) {
      penaltySubTypeId
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  code: string().required('Code is required'),
  duration: number().positive().required('Duration is required'),
})

const schemaSubType = object().shape({
  name: string().required('Name is required'),
  code: string().required('Code is required'),
})

const PenaltyTypes = props => {
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
  ] = useLazyQuery(GET_PENALTY_TYPES, {
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

  const [deletePenaltyType, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_PENALTY_TYPE,
    {
      update(cache, { data: { deleted } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PENALTY_TYPES,
            variables: {
              rulePackId,
            },
          })
          const updatedData = queryResult.rulePack[0].penaltyTypes.filter(
            p => p.penaltyTypeId !== deleted.penaltyTypeId
          )

          const updatedResult = {
            rulePack: [
              {
                ...queryResult.rulePack[0],
                penaltyTypes: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_PENALTY_TYPES,
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
        enqueueSnackbar(`PenaltyType was deleted!`, {
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

  const rulePackPenaltyTypesColumns = useMemo(
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
        width: 100,
        valueFormatter: params => {
          return showTimeAsMinutes(params.value)
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
              dialogTitle={'Do you really want to delete this penalty type?'}
              dialogDescription={'Penalty type will be completely delete'}
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() =>
                deletePenaltyType({
                  variables: {
                    penaltyTypeId: params.row.penaltyTypeId,
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
        aria-controls="penalty-types-content"
        id="penalty-types-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Penalty Types
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
                columns={rulePackPenaltyTypesColumns}
                rows={setIdFromEntityId(rulePack.penaltyTypes, 'penaltyTypeId')}
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
        data={rulePack?.penaltyTypes?.find(
          gt => gt.penaltyTypeId === formData.current
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
    mergeRulePackPenaltyType,
    { loading: loadingMergePenaltyType },
  ] = useMutation(MERGE_RULEPACK_PENALTY_TYPE, {
    update(cache, { data: { penaltyTypeRulePack } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_PENALTY_TYPES,
          variables: {
            rulePackId,
          },
        })

        const existingData = queryResult.rulePack[0].penaltyTypes
        const newItem = penaltyTypeRulePack.to
        let updatedData = []
        if (
          existingData.find(ed => ed.penaltyTypeId === newItem.penaltyTypeId)
        ) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.penaltyTypeId === newItem.penaltyTypeId ? newItem : ed
          )
        } else {
          // add new item if item not in array
          updatedData = [newItem, ...existingData]
        }

        const updatedResult = {
          rulePack: [
            {
              ...queryResult.rulePack[0],
              penaltyTypes: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_PENALTY_TYPES,
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
        `${data.penaltyTypeRulePack.to.name} added to ${rulePack.name}!`,
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
        const { name, code, duration } = dataToCheck

        mergeRulePackPenaltyType({
          variables: {
            rulePackId,
            name,
            code,
            duration: parseInt(duration),
            penaltyTypeId: data?.penaltyTypeId || uuidv4(),
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
      <DialogTitle id="alert-dialog-title">{`Add new penalty type to ${rulePack?.name}`}</DialogTitle>
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
                  <Grid item xs={12} sm={6} md={6} lg={6}>
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
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </form>

        <div style={{ margin: '2rem 0' }}>
          {data?.subTypes?.map(st => (
            <SubType
              key={st.penaltySubTypeId}
              rulePack={rulePack}
              rulePackId={rulePackId}
              penaltyTypeId={data?.penaltyTypeId}
              setNewSubType={setNewSubType}
              data={st}
            />
          ))}
        </div>
        <div style={{ margin: '2rem 0' }}>
          {data?.penaltyTypeId && newSubType ? (
            <SubType
              rulePack={rulePack}
              rulePackId={rulePackId}
              penaltyTypeId={data?.penaltyTypeId}
              setNewSubType={setNewSubType}
              data={{
                penaltySubTypeId: null,
                name: '',
                code: '',
              }}
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
          pending={loadingMergePenaltyType}
        >
          {loadingMergePenaltyType ? 'Saving...' : 'Save'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

const SubType = props => {
  const { rulePack, rulePackId, penaltyTypeId, data, setNewSubType } = props
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schemaSubType),
  })

  const [
    mergePenaltyTypePenaltySubType,
    { loading: loadingMergePenaltySubType },
  ] = useMutation(MERGE_PENALTY_TYPE_PENALTY_SUB_TYPE, {
    update(cache, { data: { penaltySubTypePenaltyType } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_PENALTY_TYPES,
          variables: {
            rulePackId,
          },
        })

        const penaltyType = queryResult.rulePack[0].penaltyTypes.find(
          gt => gt.penaltyTypeId === penaltyTypeId
        )
        const existingData = penaltyType.subTypes
        const newItem = penaltySubTypePenaltyType.to

        let updatedData = []
        if (
          existingData.find(
            ed => ed.penaltySubTypeId === newItem.penaltySubTypeId
          )
        ) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.penaltySubTypeId === newItem.penaltySubTypeId ? newItem : ed
          )
        } else {
          // add new item if item not in array
          updatedData = [...existingData, newItem]
        }

        const updatedResult = {
          rulePack: [
            {
              ...queryResult.rulePack[0],
              penaltyTypes: [
                ...queryResult.rulePack[0].penaltyTypes.filter(
                  gt => gt.penaltyTypeId !== penaltyTypeId
                ),
                { ...penaltyType, subTypes: updatedData },
              ],
            },
          ],
        }
        cache.writeQuery({
          query: GET_PENALTY_TYPES,
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
        `${data.penaltySubTypePenaltyType.to.name} added to ${rulePack.name}!`,
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
    deletePenaltySubType,
    { loading: mutationLoadingDeletePenaltySubType },
  ] = useMutation(DELETE_PENALTY_SUB_TYPE, {
    variables: {
      penaltySubTypeId: data?.penaltySubTypeId,
    },
    update(cache, { data: { deleted } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_PENALTY_TYPES,
          variables: {
            rulePackId,
          },
        })

        const penaltyType = queryResult.rulePack[0].penaltyTypes.find(
          gt => gt.penaltyTypeId === penaltyTypeId
        )

        const updatedData = penaltyType.subTypes.filter(
          p => p.penaltySubTypeId !== deleted.penaltySubTypeId
        )

        const updatedResult = {
          rulePack: [
            {
              ...queryResult.rulePack[0],
              penaltyTypes: [
                ...queryResult.rulePack[0].penaltyTypes.filter(
                  gt => gt.penaltyTypeId !== penaltyTypeId
                ),
                {
                  ...penaltyType,
                  subTypes: updatedData,
                },
              ],
            },
          ],
        }
        cache.writeQuery({
          query: GET_PENALTY_TYPES,
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
        const { name, code } = dataToCheck

        mergePenaltyTypePenaltySubType({
          variables: {
            penaltyTypeId,
            name,
            code,
            penaltySubTypeId: checkId(data?.penaltySubTypeId || 'new'),
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    [penaltyTypeId, data]
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
                {data?.penaltySubTypeId && (
                  <LoadingButton
                    onClick={() => {
                      deletePenaltySubType()
                    }}
                    type="button"
                    pending={mutationLoadingDeletePenaltySubType}
                  >
                    {mutationLoadingDeletePenaltySubType
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
                  pending={loadingMergePenaltySubType}
                >
                  {loadingMergePenaltySubType ? 'Saving...' : 'Save'}
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Container>
  )
}

PenaltyTypes.propTypes = {
  rulePackId: PropTypes.string,
}

export { PenaltyTypes }
