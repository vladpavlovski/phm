import React, { useCallback, useState, useMemo, useRef } from 'react'
import { gql, useMutation, MutationFunction } from '@apollo/client'
import { useSnackbar } from 'notistack'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { object, string } from 'yup'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import CreateIcon from '@mui/icons-material/Create'
import Toolbar from '@mui/material/Toolbar'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import LoadingButton from '@mui/lab/LoadingButton'

import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import { RHFInput } from 'components'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from 'utils'

import { Team, Position } from 'utils/types'

const CREATE_DEFAULT_POSITIONS = gql`
  mutation createPositions($teamId: ID!, $systemSettingsId: ID!) {
    defaultPositions: CreateTeamDefaultPositions(
      teamId: $teamId
      systemSettingsId: $systemSettingsId
    ) {
      positionId
      name
      short
      description
    }
  }
`
type TPositions = {
  teamId: string
  updateTeam: MutationFunction
  team: Team
}

const Positions: React.FC<TPositions> = props => {
  const { teamId, team, updateTeam } = props
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef(null)
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])

  const [createDefaultPositions, { loading: queryCreateDefaultLoading }] =
    useMutation(CREATE_DEFAULT_POSITIONS, {
      variables: {
        teamId,
        systemSettingsId: 'system-settings',
      },

      update(cache, { data: { defaultPositions } }) {
        try {
          console.log(cache, defaultPositions)
          // const queryResult = cache.readQuery({
          //   query: GET_POSITIONS,
          //   variables: {
          //     teamId,
          //   },
          // })

          // const updatedResult = {
          //   team: [
          //     {
          //       ...queryResult.team[0],
          //       positions: defaultPositions,
          //     },
          //   ],
          // }
          // cache.writeQuery({
          //   query: GET_POSITIONS,
          //   data: updatedResult,
          //   variables: {
          //     teamId,
          //   },
          // })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar(`Default positions added to ${team.name}!`, {
          variant: 'success',
        })
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    })

  const handleOpenDialog = useCallback(data => {
    formData.current = data
    setOpenDialog(true)
  }, [])

  const teamPositionsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },

      {
        field: 'short',
        headerName: 'Short',
        width: 200,
      },

      {
        field: 'description',
        headerName: 'Description',
        width: 200,
      },

      {
        field: 'positionId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Button
              type="button"
              onClick={() => {
                handleOpenDialog(params.row)
              }}
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
        field: 'deleteButton',
        headerName: 'Delete',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Delete'}
              textLoading={'Deleting...'}
              dialogTitle={'Do you really want to delete team position?'}
              dialogDescription={
                'Position will completely delete from database.'
              }
              dialogNegativeText={'No, keep position'}
              dialogPositiveText={'Yes, delete position'}
              onDialogClosePositive={() => {
                updateTeam({
                  variables: {
                    where: {
                      teamId,
                    },
                    update: {
                      positions: {
                        disconnect: {
                          where: {
                            node: {
                              positionId: params.row.positionId,
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
        aria-controls="positions-content"
        id="positions-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Positions
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Toolbar disableGutters className={classes.toolbarForm}>
          <div />
          <div>
            <Button
              type="button"
              onClick={handleOpenDialog}
              variant={'outlined'}
              size="small"
              className={classes.submit}
              startIcon={<AddIcon />}
            >
              Create Position
            </Button>

            {team?.positions?.length === 0 ? (
              <LoadingButton
                type="button"
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => {
                  createDefaultPositions()
                }}
                className={classes.submit}
                startIcon={<CreateIcon />}
                loading={queryCreateDefaultLoading}
              >
                {queryCreateDefaultLoading ? 'Creating...' : 'Create default'}
              </LoadingButton>
            ) : null}
          </div>
        </Toolbar>
        <div style={{ height: 600 }} className={classes.xGridDialog}>
          <DataGridPro
            columns={teamPositionsColumns}
            rows={setIdFromEntityId(team?.positions, 'positionId')}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </AccordionDetails>
      <FormDialog
        team={team}
        teamId={teamId}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        data={formData.current}
        updateTeam={updateTeam}
      />
    </Accordion>
  )
}

const schema = object().shape({
  name: string().required('Name is required'),
  description: string(),
  short: string(),
})

type TFormDialog = {
  team: Team
  teamId: string
  openDialog: boolean
  handleCloseDialog: () => void
  data: Position | null
  updateTeam: MutationFunction
}

const FormDialog: React.FC<TFormDialog> = props => {
  const { team, teamId, openDialog, handleCloseDialog, data, updateTeam } =
    props

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        data?.positionId
          ? updateTeam({
              variables: {
                where: {
                  teamId,
                },
                update: {
                  positions: {
                    where: {
                      node: {
                        positionId: data?.positionId,
                      },
                    },
                    update: dataToCheck,
                  },
                },
              },
            })
          : updateTeam({
              variables: {
                where: {
                  teamId,
                },
                create: {
                  positions: { node: dataToCheck },
                },
              },
            })
        handleCloseDialog()
      } catch (error) {
        console.error(error)
      }
    },
    [teamId, data]
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
        <DialogTitle id="alert-dialog-title">{`Add new position to ${team?.name}`}</DialogTitle>
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
                      defaultValue={data?.short || ''}
                      name="short"
                      label="Short"
                      fullWidth
                      variant="standard"
                      error={errors?.short}
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

export { Positions }
