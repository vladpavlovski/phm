import React from 'react'
import { gql, useMutation, MutationFunction } from '@apollo/client'
import { useSnackbar } from 'notistack'

import AddIcon from '@mui/icons-material/Add'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'
import { useStyles } from '../../../../commonComponents/styled'
import { setIdFromEntityId } from 'utils'
import { TeamPersonsContext } from './index'
import { Person, Team } from 'utils/types'

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

type TSetPersonOccupation = {
  person: Person
}

export const SetPersonOccupation: React.FC<TSetPersonOccupation> = props => {
  const { person } = props
  const classes = useStyles()

  const { update } = React.useContext(TeamPersonsContext)

  return (
    <Button
      type="button"
      onClick={() => {
        update(state => ({
          ...state,
          personOccupationDialogOpen: true,
          personData: person,
        }))
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

type TPersonOccupationDialog = {
  team: Team
}

export const PersonOccupationDialog: React.FC<TPersonOccupationDialog> =
  React.memo(props => {
    const { team } = props
    const { enqueueSnackbar } = useSnackbar()
    const classes = useStyles()
    const { state, update } = React.useContext(TeamPersonsContext)

    const handleCloseDialog = React.useCallback(() => {
      update(state => ({
        ...state,
        personOccupationDialogOpen: false,
        personData: null,
      }))
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

    const teamOccupationsColumns = React.useMemo<GridColumns>(
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
              state.personData && (
                <ToggleOccupation
                  occupationId={params.value}
                  person={state.personData}
                  updatePerson={updatePerson}
                />
              )
            )
          },
        },
      ],
      [state]
    )
    return (
      <Dialog
        fullWidth
        maxWidth="md"
        open={state?.personOccupationDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {team?.occupations && (
          <>
            <DialogTitle id="alert-dialog-title">{`Set ${state?.personData?.name} occupations for ${team?.name}`}</DialogTitle>
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
  })

type TToggleOccupation = {
  occupationId: string
  person: Person
  updatePerson: MutationFunction
}
const ToggleOccupation: React.FC<TToggleOccupation> = React.memo(props => {
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
    />
  )
})
