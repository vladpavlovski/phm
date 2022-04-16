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
import { ShotType, ShotSubType } from 'utils/types'

const GET_SHOT_TYPES = gql`
  query getRulePack($where: ShotTypeWhere) {
    shotTypes(where: $where) {
      shotTypeId
      name
      code
      priority
      subTypes {
        shotSubTypeId
        name
        code
        priority
      }
    }
  }
`

const CREATE_SHOT_TYPE = gql`
  mutation createShotType($input: [ShotTypeCreateInput!]!) {
    createShotTypes(input: $input) {
      shotTypes {
        shotTypeId
        name
        code
        priority
        subTypes {
          shotSubTypeId
          name
          code
          priority
        }
      }
    }
  }
`

const UPDATE_SHOT_TYPE = gql`
  mutation updateShotType(
    $where: ShotTypeWhere
    $update: ShotTypeUpdateInput
    $create: ShotTypeRelationInput
  ) {
    updateShotTypes(where: $where, update: $update, create: $create) {
      shotTypes {
        shotTypeId
        name
        code
        priority
        subTypes {
          shotSubTypeId
          name
          code
          priority
        }
      }
    }
  }
`

const DELETE_SHOT_TYPE = gql`
  mutation deleteShotType($where: ShotTypeWhere) {
    deleteShotTypes(where: $where) {
      nodesDeleted
    }
  }
`

const DELETE_SHOT_SUB_TYPE = gql`
  mutation deleteShotSubType($where: ShotSubTypeWhere) {
    deleteShotSubTypes(where: $where) {
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
  shotTypes: ShotType[]
}

type TQueryTypeVars = {
  where: {
    rulePack: {
      rulePackId: string
    }
  }
}
const ShotTypes: React.FC<TRelations> = props => {
  const { rulePackId } = props

  const classes = useStyles()
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef<ShotType | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery<TQueryTypeData, TQueryTypeVars>(GET_SHOT_TYPES, {
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

  const [deleteShotType, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_SHOT_TYPE,
    {
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_SHOT_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const updatedData = queryResult?.shotTypes?.filter(
            p => p.shotTypeId !== formData.current?.shotTypeId
          )

          const updatedResult = {
            shotTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_SHOT_TYPES,
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
        enqueueSnackbar(`ShotType was deleted!`, {
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

  const rulePackShotTypesColumns = useMemo<GridColumns>(
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
        field: 'shotTypeId',
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
              dialogTitle={'Do you really want to delete this shot type?'}
              dialogDescription={'Shot type will be completely delete'}
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() => {
                formData.current = params.row
                deleteShotType({
                  variables: {
                    where: { shotTypeId: params.row.shotTypeId },
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
        aria-controls="shot-types-content"
        id="shot-types-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Shot Types
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
                columns={rulePackShotTypesColumns}
                rows={setIdFromEntityId(queryData?.shotTypes, 'shotTypeId')}
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
          queryData?.shotTypes?.find(
            st => st.shotTypeId === formData.current?.shotTypeId
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
  data: ShotType | null
}

const FormDialog: React.FC<TFormDialog> = React.memo(props => {
  const { rulePackId, openDialog, handleCloseDialog, data } = props
  const [newSubType, setNewSubType] = useState(false)

  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [createShotType, { loading: mutationLoadingCreate }] = useMutation(
    CREATE_SHOT_TYPE,
    {
      update(cache, { data: { createShotTypes } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_SHOT_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const newItem = createShotTypes?.shotTypes?.[0]

          const existingData = queryResult?.shotTypes || []
          const updatedData = [newItem, ...existingData]
          const updatedResult = {
            shotTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_SHOT_TYPES,
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

  const [updateShotType, { loading: mutationLoadingUpdate }] = useMutation(
    UPDATE_SHOT_TYPE,
    {
      update(cache, { data: { updateShotTypes } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_SHOT_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })

          const newItem = updateShotTypes?.shotTypes?.[0]

          const existingData = queryResult?.shotTypes || []
          const updatedData = existingData?.map(ed =>
            ed.shotTypeId === newItem.shotTypeId ? newItem : ed
          )
          const updatedResult = {
            shotTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_SHOT_TYPES,
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

        data?.shotTypeId
          ? updateShotType({
              variables: {
                where: {
                  shotTypeId: data?.shotTypeId,
                },
                update: {
                  name,
                  code,
                  priority: `${priority}`,
                },
              },
            })
          : createShotType({
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
      onClose={handleCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{`Add new shot type`}</DialogTitle>
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
              updateShotType={updateShotType}
              key={st.shotSubTypeId}
              rulePackId={rulePackId}
              shotTypeId={data?.shotTypeId}
              data={st}
              mutationLoadingUpdate={mutationLoadingUpdate}
            />
          ))}
        </div>
        <div style={{ margin: '2rem 0' }}>
          {data?.shotTypeId && newSubType ? (
            <SubType
              updateShotType={updateShotType}
              rulePackId={rulePackId}
              shotTypeId={data?.shotTypeId}
              data={{
                shotSubTypeId: '',
                name: '',
                code: '',
                priority: 0,
              }}
              mutationLoadingUpdate={mutationLoadingUpdate}
            />
          ) : (
            data?.shotTypeId && (
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
          onClick={() => {
            handleSubmit(onSubmit)()
          }}
          type="button"
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
  shotTypeId: string
  mutationLoadingUpdate: boolean
  updateShotType: MutationFunction
  data: ShotSubType | null
}

const SubType: React.FC<TSubFormDialog> = React.memo(props => {
  const {
    rulePackId,
    shotTypeId,
    data,
    updateShotType,
    mutationLoadingUpdate,
  } = props
  const { enqueueSnackbar } = useSnackbar()

  const shotSubTypeIdDelete = React.useRef(data?.shotSubTypeId)

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [deleteShotSubType, { loading: mutationLoadingDeleteShotSubType }] =
    useMutation(DELETE_SHOT_SUB_TYPE, {
      variables: {
        where: { shotSubTypeId: data?.shotSubTypeId },
      },
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_SHOT_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })

          const shotType = queryResult?.shotTypes?.find(
            gt => gt.shotTypeId === shotTypeId
          )

          const updatedData = shotType?.subTypes?.filter(
            p => p.shotSubTypeId !== shotSubTypeIdDelete.current
          )

          const updatedResult = {
            shotTypes: [
              ...(queryResult?.shotTypes?.filter(
                gt => gt.shotTypeId !== shotTypeId
              ) || []),
              {
                ...shotType,
                subTypes: updatedData,
              },
            ],
          }

          cache.writeQuery({
            query: GET_SHOT_TYPES,
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
        enqueueSnackbar(`ShotSubType was deleted!`, {
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
        data?.shotSubTypeId
          ? updateShotType({
              variables: {
                where: {
                  shotTypeId,
                },
                update: {
                  subTypes: {
                    where: {
                      node: { shotSubTypeId: data?.shotSubTypeId },
                    },
                    update: {
                      node: { name, code, priority: `${priority}` },
                    },
                  },
                },
              },
            })
          : updateShotType({
              variables: {
                where: {
                  shotTypeId,
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
    [shotTypeId, data]
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
          {data?.shotSubTypeId && (
            <LoadingButton
              onClick={() => {
                deleteShotSubType()
              }}
              type="button"
              loading={mutationLoadingDeleteShotSubType}
            >
              {mutationLoadingDeleteShotSubType ? 'Deleting...' : 'Delete'}
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

export { ShotTypes }
