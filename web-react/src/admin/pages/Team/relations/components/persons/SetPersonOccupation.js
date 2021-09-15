import React from 'react'
import { gql, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import AddIcon from '@mui/icons-material/Add'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'
import { useStyles } from '../../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../../utils'
import TeamPersonsContext from './context'

const UPDATE_PERSON = gql`
  mutation updatePerson($where: PersonWhere, $update: PersonUpdateInput) {
    updatePeople(where: $where, update: $update) {
      people {
        personId
        firstName
        lastName
        name
        occupations {
          occupationId
          name
        }
      }
    }
  }
`

export const SetPersonOccupation = props => {
  const { person } = props
  const classes = useStyles()

  const { setPersonOccupationDialogOpen, setPersonData } =
    React.useContext(TeamPersonsContext)

  return (
    <Button
      type="button"
      onClick={() => {
        setPersonData(person)
        setPersonOccupationDialogOpen(true)
      }}
      variant={'outlined'}
      size="small"
      className={classes.submit}
      startIcon={<AddIcon />}
    >
      Set Occupation
    </Button>
  )
}

export const PersonOccupationDialog = props => {
  const { team } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const {
    personOccupationDialogOpen,
    setPersonOccupationDialogOpen,
    personData: person,
    setPersonData,
  } = React.useContext(TeamPersonsContext)

  const handleCloseDialog = React.useCallback(() => {
    setPersonOccupationDialogOpen(false)
    setPersonData(null)
  }, [])

  const [updatePerson] = useMutation(UPDATE_PERSON, {
    onCompleted: () => {
      enqueueSnackbar(`Person updated!`, {
        variant: 'success',
      })
    },
    onError: error => {
      enqueueSnackbar(`Error : ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const teamOccupationsColumns = React.useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },
      {
        field: 'occupationId',
        headerName: 'Has Occupation',
        width: 250,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleOccupation
              occupationId={params.value}
              person={person}
              updatePerson={updatePerson}
            />
          )
        },
      },
    ],
    [person]
  )
  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={personOccupationDialogOpen}
      onClose={handleCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {team?.occupations && (
        <>
          <DialogTitle id="alert-dialog-title">{`Set ${person?.name} occupations for ${team?.name}`}</DialogTitle>
          <DialogContent>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <DataGridPro
                columns={teamOccupationsColumns}
                rows={setIdFromEntityId(team?.occupations, 'occupationId')}
                disableSelectionOnClick
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </div>
          </DialogContent>
        </>
      )}
      <DialogActions>
        <Button onClick={handleCloseDialog}>{'Done'}</Button>
      </DialogActions>
    </Dialog>
  )
}

const ToggleOccupation = props => {
  const { occupationId, person, updatePerson } = props
  const [isMember, setIsMember] = React.useState(
    !!person?.occupations?.find(p => p.occupationId === occupationId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updatePerson({
          variables: {
            where: {
              personId: person.personId,
            },
            update: {
              occupations: {
                ...(!isMember
                  ? {
                      connect: {
                        where: {
                          node: {
                            occupationId,
                          },
                        },
                      },
                    }
                  : {
                      disconnect: {
                        where: {
                          node: {
                            occupationId,
                          },
                        },
                      },
                    }),
              },
            },
          },
        })

        setIsMember(!isMember)
      }}
      name="teamMember"
      color="primary"
      label={isMember ? 'In occupation' : 'No occupation'}
    />
  )
}
ToggleOccupation.propTypes = {
  personId: PropTypes.string,
  teamId: PropTypes.string,
  team: PropTypes.object,
  updatePerson: PropTypes.func,
}

SetPersonOccupation.propTypes = {
  teamId: PropTypes.string,
}
