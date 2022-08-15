import { Error, Loader } from 'components'
import React from 'react'
import { getXGridValueFromArray, setIdFromEntityId } from 'utils'
import { Team } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Switch from '@mui/material/Switch'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'
import { useStyles } from '../../../../commonComponents/styled'

export const GET_ALL_PERSONS = gql`
  query getPersons {
    people {
      personId
      name
      firstName
      lastName
      teams {
        teamId
        name
      }
      occupations {
        occupationId
        name
      }
    }
  }
`

type TAddPerson = {
  teamId: string
  updateTeam: MutationFunction
  team: Team
}

const AddPerson: React.FC<TAddPerson> = props => {
  const { teamId, team, updateTeam } = props

  const [openAddPerson, setOpenAddPerson] = React.useState(false)

  const handleCloseAddPerson = React.useCallback(() => {
    setOpenAddPerson(false)
  }, [])

  const [
    getAllPersons,
    {
      loading: queryAllPersonsLoading,
      error: queryAllPersonsError,
      data: queryAllPersonsData,
    },
  ] = useLazyQuery(GET_ALL_PERSONS, {
    fetchPolicy: 'cache-and-network',
  })

  const handleOpenAddPerson = React.useCallback(() => {
    if (!queryAllPersonsData) {
      getAllPersons()
    }
    setOpenAddPerson(true)
  }, [])

  const allPersonsColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },
      {
        field: 'teams',
        headerName: 'Teams',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.teams, 'name')
        },
      },
      {
        field: 'occupations',
        headerName: 'Occupations',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.occupations, 'name')
        },
      },

      {
        field: 'personId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewPerson
              personId={params.value}
              teamId={teamId}
              team={team}
              updateTeam={updateTeam}
            />
          )
        },
      },
    ],
    [team]
  )

  return (
    <>
      <Button
        type="button"
        onClick={handleOpenAddPerson}
        variant={'outlined'}
        size="small"
        startIcon={<AddIcon />}
      >
        Add Person
      </Button>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddPerson}
        onClose={handleCloseAddPerson}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllPersonsLoading && !queryAllPersonsError && <Loader />}
        {queryAllPersonsError && !queryAllPersonsLoading && (
          <Error message={queryAllPersonsError.message} />
        )}
        {queryAllPersonsData &&
          !queryAllPersonsLoading &&
          !queryAllPersonsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add new person to ${
                team && team.name
              }`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600, width: '100%' }}>
                  <DataGridPro
                    columns={allPersonsColumns}
                    rows={setIdFromEntityId(
                      queryAllPersonsData?.people,
                      'personId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllPersonsLoading}
                    components={{
                      Toolbar: GridToolbar,
                    }}
                  />
                </div>
              </DialogContent>
            </>
          )}
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseAddPerson()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

type TToggleNewPerson = {
  personId: string
  teamId: string
  team: Team
  updateTeam: MutationFunction
}

const ToggleNewPerson: React.FC<TToggleNewPerson> = props => {
  const { personId, teamId, team, updateTeam } = props
  const [isMember, setIsMember] = React.useState(
    !!team.persons.find(p => p.personId === personId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updateTeam({
          variables: {
            where: {
              teamId,
            },
            update: {
              persons: {
                ...(!isMember
                  ? {
                      connect: {
                        where: {
                          node: {
                            personId,
                          },
                        },
                      },
                    }
                  : {
                      disconnect: {
                        where: {
                          node: {
                            personId,
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
}

export { AddPerson }
