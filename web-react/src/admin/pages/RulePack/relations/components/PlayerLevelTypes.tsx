import { Error, Loader, RHFInput, RHFSelect } from 'components'
import { useSnackbar } from 'notistack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { setIdFromEntityId } from 'utils'
import { levelsIcon } from 'utils/constants/levelIcons'
import { PlayerLevelType } from 'utils/types'
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
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

const GET_PLAYER_LEVEL_TYPES = gql`
  query getRulePack($where: PlayerLevelTypeWhere) {
    playerLevelTypes(where: $where) {
      playerLevelTypeId
      name
      code
      description
      icon
      priority
    }
  }
`

const CREATE_PLAYER_LEVEL_TYPE = gql`
  mutation createPlayerLevelType($input: [PlayerLevelTypeCreateInput!]!) {
    createPlayerLevelTypes(input: $input) {
      playerLevelTypes {
        playerLevelTypeId
        name
        code
        description
        icon
        priority
      }
    }
  }
`

const UPDATE_PLAYER_LEVEL_TYPE = gql`
  mutation updatePlayerLevelType(
    $where: PlayerLevelTypeWhere
    $update: PlayerLevelTypeUpdateInput
  ) {
    updatePlayerLevelTypes(where: $where, update: $update) {
      playerLevelTypes {
        playerLevelTypeId
        name
        code
        description
        icon
        priority
      }
    }
  }
`

const DELETE_PLAYER_LEVEL_TYPE = gql`
  mutation deletePlayerLevelType($where: PlayerLevelTypeWhere) {
    deletePlayerLevelTypes(where: $where) {
      nodesDeleted
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  priority: number(),
  icon: string(),
  description: string(),
})

type TRelations = {
  rulePackId: string
}

type TQueryTypeData = {
  playerLevelTypes: PlayerLevelType[]
}

type TQueryTypeVars = {
  where: {
    rulePack: {
      rulePackId: string
    }
  }
}

const PlayerLevelTypes: React.FC<TRelations> = props => {
  const { rulePackId } = props
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef<PlayerLevelType | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery<TQueryTypeData, TQueryTypeVars>(GET_PLAYER_LEVEL_TYPES, {
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

  const [deletePlayerLevelType, { loading: mutationLoadingRemove }] =
    useMutation(DELETE_PLAYER_LEVEL_TYPE, {
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_PLAYER_LEVEL_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const updatedData = queryResult?.playerLevelTypes?.filter(
            p => p.playerLevelTypeId !== formData.current?.playerLevelTypeId
          )

          const updatedResult = {
            playerLevelTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_PLAYER_LEVEL_TYPES,
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
        enqueueSnackbar(`Player Level  type was deleted!`, {
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

  const rulePackPlayerLevelTypesColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'playerLevelTypeId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Button
              type="button"
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
              dialogTitle={'Do you really want to delete this position type?'}
              dialogDescription={'Player Level  type will be completely delete'}
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() => {
                formData.current = params.row
                deletePlayerLevelType({
                  variables: {
                    where: {
                      playerLevelTypeId: params.row.playerLevelTypeId,
                    },
                  },
                })
              }}
            />
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'icon',
        headerName: 'Icon',
        width: 100,
      },
      {
        field: 'description',
        headerName: 'Description',
        width: 300,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 100,
      },
      {
        field: 'code',
        headerName: 'Code',
        width: 100,
      },
    ],
    []
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="position-types-content"
        id="position-types-header"
      >
        <Typography>Player Level Types</Typography>
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
                  type="button"
                  onClick={handleOpenDialog}
                  variant={'outlined'}
                  size="small"
                  startIcon={<CreateIcon />}
                >
                  Create Player Level
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600, width: '100%' }}>
              <DataGridPro
                columns={rulePackPlayerLevelTypesColumns}
                rows={setIdFromEntityId(
                  queryData?.playerLevelTypes,
                  'playerLevelTypeId'
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
        data={formData.current}
      />
    </Accordion>
  )
}

type TFormDialog = {
  rulePackId: string
  openDialog: boolean
  handleCloseDialog: () => void
  data: PlayerLevelType | null
}

const FormDialog: React.FC<TFormDialog> = props => {
  const { rulePackId, openDialog, handleCloseDialog, data } = props

  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [createPlayerLevelType, { loading: mutationLoadingCreate }] =
    useMutation(CREATE_PLAYER_LEVEL_TYPE, {
      update(cache, { data: { createPlayerLevelTypes } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_PLAYER_LEVEL_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const newItem = createPlayerLevelTypes?.playerLevelTypes?.[0]

          const existingData = queryResult?.playerLevelTypes || []
          const updatedData = [newItem, ...existingData]
          const updatedResult = {
            playerLevelTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_PLAYER_LEVEL_TYPES,
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
        enqueueSnackbar('Player Level  type saved!', { variant: 'success' })
        handleCloseDialog()
      },
      onError: error => {
        enqueueSnackbar(`Error: ${error}`, {
          variant: 'error',
        })
      },
    })

  const [updatePlayerLevelType, { loading: mutationLoadingMerge }] =
    useMutation(UPDATE_PLAYER_LEVEL_TYPE, {
      update(cache, { data: { updatePlayerLevelTypes } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_PLAYER_LEVEL_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })

          const newItem = updatePlayerLevelTypes?.playerLevelTypes?.[0]

          const existingData = queryResult?.playerLevelTypes
          const updatedData = existingData?.map(ed =>
            ed.playerLevelTypeId === newItem.playerLevelTypeId ? newItem : ed
          )
          const updatedResult = {
            playerLevelTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_PLAYER_LEVEL_TYPES,
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
        enqueueSnackbar('Player Level  type updated!', { variant: 'success' })
        handleCloseDialog()
      },
      onError: error => {
        enqueueSnackbar(`Error: ${error}`, {
          variant: 'error',
        })
      },
    })

  const onSubmit = useCallback(
    dataToSubmit => {
      try {
        const { name } = dataToSubmit
        const code = name.toLowerCase().replace(/\s/g, '-')
        data?.playerLevelTypeId
          ? updatePlayerLevelType({
              variables: {
                where: {
                  playerLevelTypeId: data?.playerLevelTypeId,
                },
                update: { ...dataToSubmit, code },
              },
            })
          : createPlayerLevelType({
              variables: {
                input: {
                  ...dataToSubmit,
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
      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <DialogTitle id="alert-dialog-title">{`Add new Player Level Type`}</DialogTitle>
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
                      defaultValue={data?.description || ''}
                      name="description"
                      label="Description"
                      fullWidth
                      variant="standard"
                      error={errors?.description}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFSelect
                      control={control}
                      defaultValue={data?.icon || ''}
                      name="icon"
                      label="Icon"
                      fullWidth
                      variant="standard"
                      error={errors?.icon}
                    >
                      {Object.values(levelsIcon).reduce((acc, curr) => {
                        const Icon = curr.icon
                        const element = (
                          <MenuItem key={curr.code} value={curr.code}>
                            {curr.name} <Icon />
                          </MenuItem>
                        )
                        return [...acc, element]
                      }, [] as JSX.Element[])}
                    </RHFSelect>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFInput
                      control={control}
                      defaultValue={data?.priority || ''}
                      name="priority"
                      label="Priority"
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
            loading={mutationLoadingCreate || mutationLoadingMerge}
          >
            {mutationLoadingCreate || mutationLoadingMerge
              ? 'Saving...'
              : 'Save'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export { PlayerLevelTypes }
