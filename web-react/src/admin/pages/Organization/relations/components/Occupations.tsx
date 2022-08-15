import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Occupation, Organization } from 'utils/types'
import { object, string } from 'yup'
import { MutationFunction } from '@apollo/client'
import { yupResolver } from '@hookform/resolvers/yup'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LinkOffIcon from '@mui/icons-material/LinkOff'
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
import { RHFInput } from '../../../../../components/RHFInput'
import { setIdFromEntityId } from '../../../../../utils'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

type TOccupations = {
  organizationId: string
  organization: Organization
  updateOrganization: MutationFunction
}

const Occupations: React.FC<TOccupations> = props => {
  const { organizationId, organization, updateOrganization } = props
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef(null)
  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])

  // const [
  //   createDefaultOccupations,
  //   { loading: queryCreateDefaultLoading },
  // ] = useMutation(CREATE_DEFAULT_OCCUPATIONS, {
  //   variables: {
  //     organizationId,
  //     systemSettingsId: 'system-settings',
  //   },

  //   update(cache, { data: { defaultOccupations } }) {
  //     try {
  //       const queryResult = cache.readQuery({
  //         query: GET_OCCUPATIONS,
  //         variables: {
  //           organizationId,
  //         },
  //       })

  //       const updatedResult = {
  //         organization: [
  //           {
  //             ...queryResult.organization[0],
  //             occupations: defaultOccupations,
  //           },
  //         ],
  //       }
  //       cache.writeQuery({
  //         query: GET_OCCUPATIONS,
  //         data: updatedResult,
  //         variables: {
  //           organizationId,
  //         },
  //       })
  //     } catch (error) {
  //       console.error(error)
  //     }
  //   },
  //   onCompleted: () => {
  //     enqueueSnackbar(`Default occupations added to ${organization.name}!`, {
  //       variant: 'success',
  //     })
  //   },
  //   onError: error => {
  //     enqueueSnackbar(`Error happened :( ${error}`, {
  //       variant: 'error',
  //     })
  //     console.error(error)
  //   },
  // })

  const handleOpenDialog = useCallback(data => {
    formData.current = data
    setOpenDialog(true)
  }, [])

  const organizationOccupationsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },

      {
        field: 'description',
        headerName: 'Description',
        width: 200,
      },

      {
        field: 'occupationId',
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
        field: 'deleteButton',
        headerName: 'Delete',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Delete'}
              textLoading={'Deleting...'}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={
                'Do you really want to delete organization occupation?'
              }
              dialogDescription={
                'Occupation will completely delete from database.'
              }
              dialogNegativeText={'No, keep occupation'}
              dialogPositiveText={'Yes, delete occupation'}
              onDialogClosePositive={() => {
                updateOrganization({
                  variables: {
                    where: {
                      organizationId,
                    },
                    update: {
                      occupations: {
                        disconnect: {
                          where: {
                            node: {
                              occupationId: params.row.occupationId,
                            },
                          },
                        },
                      },
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
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="occupations-content"
        id="occupations-header"
      >
        <Typography>Occupations</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Toolbar
          disableGutters
          sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
        >
          <div />
          <div>
            <Button
              type="button"
              onClick={() => handleOpenDialog(null)}
              variant={'outlined'}
              size="small"
              startIcon={<AddIcon />}
            >
              Create Occupation
            </Button>

            {/* {organization?.occupations?.length === 0 && (
                  <LoadingButton
                    type="button"
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={createDefaultOccupations}
                    
                    startIcon={<CreateIcon />}
                    loading={queryCreateDefaultLoading}
                    loadingOccupation="start"
                  >
                    {queryCreateDefaultLoading
                      ? 'Creating...'
                      : 'Create default'}
                  </LoadingButton>
                )} */}
          </div>
        </Toolbar>
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
            columns={organizationOccupationsColumns}
            rows={setIdFromEntityId(organization.occupations, 'occupationId')}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </AccordionDetails>
      <FormDialog
        {...props}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        data={formData.current}
      />
    </Accordion>
  )
}

const schema = object().shape({
  name: string().required('Name is required'),
  description: string(),
})

type TFormDialog = {
  organization: Organization
  organizationId: string
  openDialog: boolean
  handleCloseDialog: () => void
  data: Occupation | null
  updateOrganization: MutationFunction
}

const FormDialog: React.FC<TFormDialog> = props => {
  const {
    organization,
    organizationId,
    openDialog,
    handleCloseDialog,
    data,
    updateOrganization,
  } = props

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        updateOrganization({
          variables: {
            where: {
              organizationId,
            },
            ...(data?.occupationId
              ? {
                  update: {
                    occupations: {
                      where: {
                        node: {
                          occupationId: data?.occupationId,
                        },
                      },
                      update: dataToCheck,
                    },
                  },
                }
              : {
                  create: {
                    occupations: { node: dataToCheck },
                  },
                }),
          },
        })
        handleCloseDialog()
      } catch (error) {
        console.error(error)
      }
    },
    [organizationId, data, updateOrganization]
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
        <DialogTitle id="alert-dialog-title">{`Add new occupation to ${organization?.name}`}</DialogTitle>
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
          <LoadingButton type="submit">{'Save'}</LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export { Occupations }
