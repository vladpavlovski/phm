import { Error, LinkButton, Loader } from 'components'
import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgCompetitionRoute } from 'router/routes'
import { setIdFromEntityId } from 'utils'
import { Award } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AccountBox from '@mui/icons-material/AccountBox'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'

export const GET_ALL_COMPETITIONS = gql`
  query getCompetitions($where: CompetitionWhere) {
    competitions(where: $where) {
      competitionId
      name
      nick
    }
  }
`

type TRelations = {
  awardId: string
  award: Award
  updateAward: MutationFunction
}

type TParams = {
  organizationSlug: string
}

const Competitions: React.FC<TRelations> = props => {
  const { awardId, updateAward, award } = props

  const { organizationSlug } = useParams<TParams>()
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_COMPETITIONS)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({
        variables: { where: { org: { urlSlug: organizationSlug } } },
      })
    }
  }, [])

  const awardCompetitionsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'competitionId',
        headerName: 'Profile',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgCompetitionRoute(organizationSlug, params.value)}
              target="_blank"
            >
              Profile
            </LinkButton>
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 250,
      },

      {
        field: 'hasAward',
        headerName: 'Has award',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNew
              competitionId={params.row.competitionId}
              awardId={awardId}
              award={award}
              updateAward={updateAward}
            />
          )
        },
      },
    ],
    [award]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="competitions-content"
        id="competitions-header"
      >
        <Typography>Competitions</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {queryData && (
          <div style={{ height: 600, width: '100%' }}>
            <DataGridPro
              disableMultipleSelection
              disableSelectionOnClick
              columns={awardCompetitionsColumns}
              rows={setIdFromEntityId(queryData?.competitions, 'competitionId')}
              loading={queryLoading}
              components={{
                Toolbar: GridToolbar,
              }}
            />
          </div>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

type TToggleNew = {
  awardId: string
  competitionId: string
  award: Award
  updateAward: MutationFunction
}

const ToggleNew: React.FC<TToggleNew> = props => {
  const { competitionId, awardId, updateAward, award } = props
  const [isMember, setIsMember] = useState(
    !!award?.competitions?.find(p => p.competitionId === competitionId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updateAward({
          variables: {
            where: {
              awardId,
            },
            update: {
              competitions: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            competitionId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { competitionId },
                        },
                      },
                    }),
              },
            },
          },
        })
        setIsMember(!isMember)
      }}
      name="competitionMember"
      color="primary"
    />
  )
}

export { Competitions }
