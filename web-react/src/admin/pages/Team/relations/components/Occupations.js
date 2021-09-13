import React, { useCallback, useState, useMemo, useRef } from 'react'

import PropTypes from 'prop-types'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { object, string } from 'yup'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'

import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import LoadingButton from '@material-ui/lab/LoadingButton'

import { XGrid, GridToolbar } from '@material-ui/x-grid'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import { RHFInput } from '../../../../../components/RHFInput'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const Occupations = props => {
  const { teamId, team, updateTeam } = props
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef(null)

  const classes = useStyles()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])

  const handleOpenDialog = useCallback(data => {
    formData.current = data
    setOpenDialog(true)
  }, [])

  const teamOccupationsColumns = useMemo(
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
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={'Do you really want to delete team occupation?'}
              dialogDescription={
                'Occupation will completely delete from database.'
              }
              dialogNegativeText={'No, keep occupation'}
              dialogPositiveText={'Yes, delete occupation'}
              onDialogClosePositive={() => {
                updateTeam({
                  variables: {
                    where: {
                      teamId,
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
        <Typography className={classes.accordionFormTitle}>
          Occupations
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Toolbar disableGutters className={classes.toolbarForm}>
          <div />
          <div>
            <Button
              type="button"
              onClick={() => {
                handleOpenDialog()
              }}
              variant={'outlined'}
              size="small"
              className={classes.submit}
              startIcon={<AddIcon />}
            >
              Create Occupation
            </Button>

            {/* {team?.occupations?.length === 0 && (
                  <LoadingButton
                    type="button"
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={createDefaultOccupations}
                    className={classes.submit}
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
        <div style={{ height: 600 }} className={classes.xGridDialog}>
          <XGrid
            columns={teamOccupationsColumns}
            rows={setIdFromEntityId(team?.occupations, 'occupationId')}
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
})

const FormDialog = props => {
  const { team, teamId, openDialog, handleCloseDialog, data, updateTeam } =
    props

  const classes = useStyles()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        data?.occupationId
          ? updateTeam({
              variables: {
                where: {
                  teamId,
                },
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
              },
            })
          : updateTeam({
              variables: {
                where: {
                  teamId,
                },
                create: {
                  occupations: { node: dataToCheck },
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={classes.form}
        noValidate
        autoComplete="off"
      >
        <DialogTitle id="alert-dialog-title">{`Add new occupation to ${team?.name}`}</DialogTitle>
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

Occupations.propTypes = {
  teamId: PropTypes.string,
}

export { Occupations }
