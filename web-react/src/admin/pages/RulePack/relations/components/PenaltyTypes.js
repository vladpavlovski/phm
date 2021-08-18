import React, { useCallback, useState, useMemo, useRef } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

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
  showTimeAsHms,
  getXGridValueFromArray,
} from '../../../../../utils'

const GET_PENALTY_TYPES = gql`
  query getRulePack($where: PenaltyTypeWhere, $whereRulePack: RulePackWhere) {
    penaltyTypes(where: $where) {
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
    rulePacks(where: $whereRulePack) {
      name
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
        subTypes {
          penaltySubTypeId
          name
          code
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
        subTypes {
          penaltySubTypeId
          name
          code
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

  const [deletePenaltyType, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_PENALTY_TYPE,
    {
      update(cache) {
        try {
          const deleted = formData.current
          const queryResult = cache.readQuery({
            query: GET_PENALTY_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })
          const updatedData = queryResult.penaltyTypes.filter(
            p => p.penaltyTypeId !== deleted.penaltyTypeId
          )

          const updatedResult = {
            penaltyTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_PENALTY_TYPES,
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
        width: 120,
      },
      {
        field: 'duration',
        headerName: 'Duration',
        width: 150,
        valueFormatter: params => {
          return showTimeAsHms(params.value)
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
        rulePack={queryData?.rulePack}
        rulePackId={rulePackId}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        data={queryData?.penaltyTypes?.find(
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

  const [createPenaltyType, { loading: mutationLoadingCreate }] = useMutation(
    CREATE_PENALTY_TYPE,
    {
      update(cache, { data: { createPenaltyTypes } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PENALTY_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })
          const newItem = createPenaltyTypes?.penaltyTypes?.[0]

          const existingData = queryResult?.penaltyTypes
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
          const queryResult = cache.readQuery({
            query: GET_PENALTY_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })

          const newItem = updatePenaltyTypes?.penaltyTypes?.[0]

          const existingData = queryResult?.penaltyTypes
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
        const { name, code, duration } = dataToCheck

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
                },
              },
            })
          : createPenaltyType({
              variables: {
                input: {
                  name,
                  code,
                  duration: parseFloat(duration),
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
              data={st}
              updatePenaltyType={updatePenaltyType}
              mutationLoadingUpdate={mutationLoadingUpdate}
            />
          ))}
        </div>
        <div style={{ margin: '2rem 0' }}>
          {data?.penaltyTypeId && newSubType ? (
            <SubType
              rulePack={rulePack}
              rulePackId={rulePackId}
              penaltyTypeId={data?.penaltyTypeId}
              data={{
                penaltySubTypeId: null,
                name: '',
                code: '',
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
}

const SubType = props => {
  const {
    rulePackId,
    penaltyTypeId,
    data,
    updatePenaltyType,
    mutationLoadingUpdate,
  } = props
  const classes = useStyles()
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
        const queryResult = cache.readQuery({
          query: GET_PENALTY_TYPES,
          variables: {
            where: { rulePack: { rulePackId } },
            whereRulePack: { rulePackId },
          },
        })

        const penaltyType = queryResult.penaltyTypes.find(
          gt => gt.penaltyTypeId === penaltyTypeId
        )

        const updatedData = penaltyType.subTypes.filter(
          p => p.penaltySubTypeId !== penaltySubTypeIdDelete.current
        )

        const updatedResult = {
          penaltyTypes: [
            ...queryResult.penaltyTypes.filter(
              gt => gt.penaltyTypeId !== penaltyTypeId
            ),
            {
              ...penaltyType,
              subTypes: updatedData,
            },
          ],

          rulePacks: queryResult?.rulePacks,
        }

        cache.writeQuery({
          query: GET_PENALTY_TYPES,
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

        data?.penaltySubTypeId
          ? updatePenaltyType({
              variables: {
                where: {
                  penaltyTypeId,
                },
                update: {
                  subTypes: {
                    where: {
                      penaltySubTypeId: data?.penaltySubTypeId,
                    },
                    update: {
                      name,
                      code,
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
                  subTypes: { node: { name, code } },
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
                    loading={mutationLoadingDeletePenaltySubType}
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

PenaltyTypes.propTypes = {
  rulePackId: PropTypes.string,
}

export { PenaltyTypes }
