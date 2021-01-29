import React, { Fragment, useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'
import { useHistory } from 'react-router-dom'

import { DataTable } from '../../../../components/DataTable'
import { getAdminPlayerRoute } from '../../../../routes'
import { LinkButton } from '../../../../components/LinkButton'

import { Error } from '../../../../components/Error'
import { Loader } from '../../../../components/Loader'

export const GET_PLAYERS = gql`
  query getPlayers {
    Player {
      playerId
      name
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
  const { loading, error, data } = useQuery(GET_PLAYERS)

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
              <LinkButton to={getAdminPlayerRoute(playerId)}>Edit</LinkButton>
            )
          },
        },
      },
    ],
    [data]
  )

  if (loading) return <Loader />
  if (error) return <Error message={error.message} />

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