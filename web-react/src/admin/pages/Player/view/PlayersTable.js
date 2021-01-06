import React, { Fragment, useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'
import { useHistory, Link } from 'react-router-dom'

import { DataTable } from '../../../../components/DataTable'
import { getAdminPlayerRoute } from '../../../../routes'

import { Button } from '@material-ui/core'

export const GET_ALL_PLAYERS = gql`
  query getPlayers {
    Player {
      playerId
      name
      birthday {
        formatted
      }
      gender
      positions {
        positionId
        name
      }
      teams {
        teamId
        name
      }
    }
  }
`

const PlayersTable = () => {
  const history = useHistory()
  const { loading, error, data } = useQuery(GET_ALL_PLAYERS)

  const options = useMemo(
    () => ({
      filterType: 'multiselect',
      print: false,
      searchOpen: false,
      download: false,
      responsive: 'vertical',
      rowsPerPage: 50,
      rowsPerPageOptions: [10, 25, 50, 100],
      customToolbarSelect: () => {},
      selectableRows: 'none',
    }),
    [data, history]
  )

  const columns = useMemo(
    () => [
      {
        name: 'name',
        label: 'Name',
        options: {
          filter: false,
          sort: true,
        },
      },
      {
        name: 'team',
        label: 'Team',
        options: {
          filter: true,
          sort: true,
          customBodyRenderLite: dataIndex => {
            const teams = data.Player[dataIndex].teams
            return (
              teams && (
                <span>
                  {teams.map((t, i) => (
                    <Fragment key={t.teamId}>
                      <span>{`${t.name}`}</span>
                      {i !== teams.length - 1 && ', '}
                    </Fragment>
                  ))}
                </span>
              )
            )
          },
        },
      },
      {
        name: 'position',
        label: 'Position',
        options: {
          filter: true,
          sort: true,
          customBodyRenderLite: dataIndex => {
            const positions = data.Player[dataIndex].positions
            return (
              positions && (
                <span>
                  {positions.map((p, i) => (
                    <Fragment key={p.positionId}>
                      <span>{`${p.name}`}</span>
                      {i !== positions.length - 1 && ', '}
                    </Fragment>
                  ))}
                </span>
              )
            )
          },
        },
      },
      {
        name: 'editButton',
        label: 'Edit',
        options: {
          filter: false,
          sort: false,
          customBodyRenderLite: dataIndex => {
            const { playerId } = data.Player[dataIndex]
            return (
              <Button
                size="small"
                variant="contained"
                color="primary"
                component={Link}
                to={getAdminPlayerRoute(playerId)}
                onClick={e => {
                  e.stopPropagation()
                }}
              >
                Edit
              </Button>
            )
          },
        },
      },
    ],
    [data]
  )

  if (loading) return 'Loading...'
  if (error) return `Error! ${error.message}`

  return (
    <DataTable
      title="Players"
      columns={columns}
      data={(data && data.Player) || []}
      options={options}
    />
  )
}

export { PlayersTable as default }
