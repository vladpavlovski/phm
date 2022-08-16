import { LinkButton, XGridPage } from 'components'
import dayjs from 'dayjs'
import { useLeagueSeasonState } from 'league/pages/Players/XGrid'
import React from 'react'
import Img from 'react-cool-img'
import { useParams } from 'react-router-dom'
import { getAdminOrgGameRoute } from 'router/routes'
import createPersistedState from 'use-persisted-state'
import { formatDate, formatTime, setIdFromEntityId } from 'utils'
import {
  Game,
  GameEventSimple,
  GamePlayersRelationship,
  GameTeamsRelationship,
  Season,
} from 'utils/types'
import { gql, useQuery } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import BalconyIcon from '@mui/icons-material/Balcony'
import EditIcon from '@mui/icons-material/Edit'
import StarIcon from '@mui/icons-material/Star'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { GridColumns } from '@mui/x-data-grid-pro'
import { GameQrPayment } from '../components'

const useGamesViewState = createPersistedState('HMS-GamesView')
const useGamesColumnsTypeState = createPersistedState('HMS-GamesColumnsType')

export const GET_GAMES = gql`
  query getGames(
    $whereGames: GameWhere
    $whereGameEvents: GameEventSimpleWhere
    $options: GameOptions
    $whereSeasons: SeasonWhere
  ) {
    games(where: $whereGames, options: $options) {
      gameId
      name
      type
      foreignId
      startDate
      startTime
      description
      info
      timekeeper
      referee
      paymentHost
      paymentGuest
      paymentTimekeeper
      paymentReferee
      headline
      perex
      body
      price
      flickrAlbum
      venue {
        name
      }
      teamsConnection {
        edges {
          host
          node {
            teamId
            name
            nick
            logo
          }
        }
      }
      playersConnection(
        where: { edge: { OR: [{ star: true }, { goalkeeper: true }] } }
      ) {
        edges {
          star
          jersey
          goalkeeper
          host
          node {
            playerId
            name
            firstName
            lastName
          }
        }
        totalCount
      }
      phase {
        phaseId
        name
        competition {
          name
        }
      }
      group {
        groupId
        name
        competition {
          name
        }
      }
      gameEventsSimple(where: $whereGameEvents) {
        gameEventSimpleId
        eventTypeCode
        team {
          teamId
        }
      }
      gameResult {
        gameStatus
        hostGoals
        guestGoals
        hostPenalties
        guestPenalties
        hostSaves
        guestSaves
        hostFaceOffs
        guestFaceOffs
      }
      org {
        urlGameLinks
        bankAccountNumber
        bankAccountCurrency
        bankCode
      }
    }
    seasons(where: $whereSeasons) {
      seasonId
      name
      status
      startDate
      endDate
    }
  }
`

export const getColumns = (organizationSlug: string): GridColumns => [
  {
    field: 'gameId',
    headerName: 'Edit',
    width: 140,
    disableColumnMenu: true,
    renderCell: params => {
      return (
        <LinkButton
          startIcon={<EditIcon />}
          to={getAdminOrgGameRoute(organizationSlug, params.value)}
        >
          Edit
        </LinkButton>
      )
    },
  },
  {
    field: 'startDate',
    headerName: 'Date',
    width: 150,
    disableColumnMenu: true,
    valueGetter: params => params?.row?.startDate,
    valueFormatter: params => formatDate(params?.value, 'dddd, DD.MM.YYYY'),
  },
  {
    field: 'startTime',
    headerName: 'Time',
    width: 70,
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.startTime,
    valueFormatter: params => {
      return typeof params?.value === 'string' ? formatTime(params?.value) : ''
    },
  },
  {
    field: 'venue',
    headerName: 'Venue',
    width: 130,
    valueGetter: params => params?.row?.venue?.name,
  },
  {
    field: 'hostTeam',
    headerName: 'Host team',
    width: 170,
    renderCell: params => {
      const team = params?.row?.teamsConnection?.edges?.find(
        (t: GameTeamsRelationship) => t?.host
      )?.node

      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            alignItems: 'center',
          }}
        >
          <span>{team?.nick}</span>
          <Img
            src={team?.logo}
            style={{ width: '4rem', height: '4rem', marginLeft: '1rem' }}
            alt={team?.name}
          />
        </div>
      )
    },
  },
  {
    field: 'score',
    headerName: 'Score',
    disableColumnMenu: true,
    resizable: false,
    width: 130,
    renderCell: params => {
      const teamHost = params?.row?.teamsConnection?.edges?.find(
        (t: GameTeamsRelationship) => t?.host
      )?.node

      const teamGuest = params?.row?.teamsConnection?.edges?.find(
        (t: GameTeamsRelationship) => !t?.host
      )?.node
      const goalsHost = params?.row?.gameEventsSimple?.filter(
        (ges: GameEventSimple) => ges?.team?.teamId === teamHost?.teamId
      )?.length
      const goalsGuest = params?.row?.gameEventsSimple?.filter(
        (ges: GameEventSimple) => ges?.team?.teamId === teamGuest?.teamId
      )?.length
      return (
        <Link
          underline="none"
          color="inherit"
          target="_blank"
          rel="noopener"
          href={
            params?.row?.org?.urlGameLinks
              ? `${params?.row?.org?.urlGameLinks}${params?.row?.gameId}`
              : ''
          }
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: '1.8rem',
              fontFamily: 'Digital Numbers Regular',
            }}
          >
            <span>{goalsHost}</span>:<span>{goalsGuest}</span>
          </div>
        </Link>
      )
    },
  },
  {
    field: 'guestTeam',
    headerName: 'Guest team',
    width: 170,
    renderCell: params => {
      const team = params?.row?.teamsConnection?.edges?.find(
        (t: GameTeamsRelationship) => !t?.host
      )?.node

      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Img
            src={team?.logo}
            style={{ width: '4rem', height: '4rem', marginRight: '1rem' }}
            alt={team?.name}
          />
          <span>{team?.nick}</span>
        </div>
      )
    },
  },
  {
    field: 'gameStatus',
    headerName: 'Status',
    width: 100,
    valueGetter: params => params?.row?.gameResult?.gameStatus || '',
  },
  {
    field: 'hostStar',
    headerName: 'Host Star',
    width: 180,
    disableColumnMenu: true,
    sortable: false,
    renderCell: params => {
      const stars = params?.row?.playersConnection?.edges?.filter(
        (e: GamePlayersRelationship) => e.host && e.star
      )

      return (
        <Stack spacing={1} direction="row">
          {stars?.map((hs: GamePlayersRelationship) => {
            return (
              <Chip
                size="small"
                key={hs?.node?.playerId}
                icon={<StarIcon />}
                label={`${hs?.node?.name} ${
                  hs?.jersey && '(' + hs?.jersey + ')'
                }`}
                color="info"
              />
            )
          })}
        </Stack>
      )
    },
  },
  {
    field: 'guestStar',
    headerName: 'Guest Star',
    width: 180,
    disableColumnMenu: true,
    sortable: false,
    renderCell: params => {
      const stars = params?.row?.playersConnection?.edges?.filter(
        (e: GamePlayersRelationship) => !e.host && e.star
      )

      return (
        <Stack spacing={1} direction="row">
          {stars?.map((hs: GamePlayersRelationship) => {
            return (
              <Chip
                size="small"
                key={hs?.node?.playerId}
                icon={<StarIcon />}
                label={`${hs?.node?.name} ${
                  hs?.jersey && '(' + hs?.jersey + ')'
                }`}
                color="info"
              />
            )
          })}
        </Stack>
      )
    },
  },
  {
    field: 'goalieHost',
    headerName: 'Goalie Host',
    width: 180,
    disableColumnMenu: true,
    sortable: false,
    renderCell: params => {
      const goalkeeper = params?.row?.playersConnection?.edges?.find(
        (e: GamePlayersRelationship) => e.host && e.goalkeeper
      )

      return (
        goalkeeper && (
          <Stack spacing={1} direction="row">
            <Chip
              size="small"
              key={goalkeeper?.node?.playerId}
              icon={<BalconyIcon />}
              label={`${goalkeeper?.node?.name} ${
                goalkeeper?.jersey && '(' + goalkeeper?.jersey + ')'
              }`}
              color="info"
            />
          </Stack>
        )
      )
    },
  },
  {
    field: 'goalieGuest',
    headerName: 'Goalie Guest',
    width: 180,
    disableColumnMenu: true,
    sortable: false,
    renderCell: params => {
      const goalkeeper = params?.row?.playersConnection?.edges?.find(
        (e: GamePlayersRelationship) => !e.host && e.goalkeeper
      )

      return (
        goalkeeper && (
          <Stack spacing={1} direction="row">
            <Chip
              size="small"
              key={goalkeeper?.node?.playerId}
              icon={<BalconyIcon />}
              label={`${goalkeeper?.node?.name} ${
                goalkeeper?.jersey && '(' + goalkeeper?.jersey + ')'
              }`}
              color="info"
            />
          </Stack>
        )
      )
    },
  },
  {
    field: 'paymentHost',
    headerName: 'Host Payment',
    width: 100,
    disableColumnMenu: true,
  },
  {
    field: 'paymentGuest',
    headerName: 'Guest Payment',
    width: 100,
    disableColumnMenu: true,
  },
  {
    field: 'paymentTimekeeper',
    headerName: 'Timekeeper Payment',
    width: 100,
    disableColumnMenu: true,
  },
  {
    field: 'paymentReferee',
    headerName: 'Referee Payment',
    width: 100,
    disableColumnMenu: true,
  },
  {
    field: 'timekeeper',
    headerName: 'Timekeeper',
    width: 200,
  },
  {
    field: 'referee',
    headerName: 'Referee',
    width: 200,
  },
  {
    field: 'foreignId',
    headerName: 'Foreign Id',
    width: 150,
  },
  {
    field: 'info',
    headerName: 'Info',
    width: 250,
  },
  {
    field: 'description',
    headerName: 'Description',
    width: 250,
  },

  {
    field: 'phase',
    headerName: 'Phase',
    width: 120,
    valueGetter: params => params?.row?.phase?.name,
  },
  {
    field: 'group',
    headerName: 'Group',
    width: 120,
    valueGetter: params => params?.row?.group?.name,
  },
  {
    field: 'competition',
    headerName: 'Competition',
    width: 200,
    valueGetter: params => {
      const phaseCompetition = params?.row?.phase?.competition?.name
      const groupCompetition = params?.row?.group?.competition?.name
      return phaseCompetition || groupCompetition
    },
  },
  {
    field: 'headline',
    headerName: 'Headline',
    width: 300,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'perex',
    headerName: 'Perex',
    width: 300,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'body',
    headerName: 'Body',
    width: 300,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'flickrAlbum',
    headerName: 'Flickr Album',
    width: 300,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'name',
    headerName: 'Name',
    width: 150,
  },
  {
    field: 'hostGoals',
    headerName: 'Goals Host',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.hostGoals,
  },
  {
    field: 'guestGoals',
    headerName: 'Goals Guest',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.guestGoals,
  },
  {
    field: 'hostPenalties',
    headerName: 'Penalties Host',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.hostPenalties,
  },
  {
    field: 'guestPenalties',
    headerName: 'Penalties Guest',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.guestPenalties,
  },
  {
    field: 'hostSaves',
    headerName: 'Saves Host',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.hostSaves,
  },
  {
    field: 'guestSaves',
    headerName: 'Saves Guest',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.guestSaves,
  },
  {
    field: 'hostFaceOffs',
    headerName: 'FaceOffs Host',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.hostFaceOffs,
  },
  {
    field: 'guestFaceOffs',
    headerName: 'FaceOffs Guest',
    width: 50,
    align: 'center',
    headerAlign: 'center',
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => params?.row?.gameResult?.guestFaceOffs,
  },
  {
    field: 'hostTeamName',
    headerName: 'Host Name',
    width: 150,
  },
  {
    field: 'guestTeamName',
    headerName: 'Guest Name',
    width: 150,
  },
  {
    field: 'hostStarName',
    headerName: 'Host Star',
    width: 180,
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => {
      const stars = params?.row?.playersConnection?.edges?.filter(
        (e: GamePlayersRelationship) => e.host && e.star
      )
      return stars?.map(
        (hs: GamePlayersRelationship) =>
          `${hs?.node?.name} ${hs?.jersey && '(' + hs?.jersey + ')'} `
      )
    },
  },
  {
    field: 'guestStarName',
    headerName: 'Guest Star',
    width: 180,
    valueGetter: params => {
      const stars = params?.row?.playersConnection?.edges?.filter(
        (e: GamePlayersRelationship) => !e.host && e.star
      )

      return stars?.map(
        (hs: GamePlayersRelationship) =>
          `${hs?.node?.name} ${hs?.jersey && '(' + hs?.jersey + ')'} `
      )
    },
  },
  {
    field: 'goalieHostName',
    headerName: 'Goalie Host',
    width: 180,
    valueGetter: params => {
      const goalkeeper = params?.row?.playersConnection?.edges?.find(
        (e: GamePlayersRelationship) => e.host && e.goalkeeper
      )

      return goalkeeper
        ? `${goalkeeper?.node?.name} ${
            goalkeeper?.jersey && '(' + goalkeeper?.jersey + ')'
          }`
        : ''
    },
  },
  {
    field: 'goalieGuestName',
    headerName: 'Goalie Guest',
    width: 180,
    valueGetter: params => {
      const goalkeeper = params?.row?.playersConnection?.edges?.find(
        (e: GamePlayersRelationship) => !e.host && e.goalkeeper
      )

      return goalkeeper
        ? `${goalkeeper?.node?.name} ${
            goalkeeper?.jersey && '(' + goalkeeper?.jersey + ')'
          }`
        : ''
    },
  },
  {
    field: 'GameQrPayment',
    headerName: 'QR Platba',
    width: 180,
    disableColumnMenu: true,
    sortable: false,
    align: 'center',
    headerAlign: 'center',
    renderCell: params => {
      const { foreignId, org, startDate, teamsConnection, price } = params.row
      const { bankAccountCurrency, bankAccountNumber, bankCode } = org
      const hostTeamNick = teamsConnection.edges.find(
        (e: GameTeamsRelationship) => e.host
      )?.node?.nick
      const guestTeamNick = teamsConnection.edges.find(
        (e: GameTeamsRelationship) => !e.host
      )?.node?.nick
      const canBeRendered =
        foreignId &&
        startDate &&
        bankAccountCurrency &&
        bankAccountNumber &&
        bankCode &&
        hostTeamNick &&
        guestTeamNick &&
        price

      return canBeRendered ? (
        <GameQrPayment
          bankAccountNumber={bankAccountNumber}
          bankCode={bankCode}
          currency={bankAccountCurrency}
          vs={foreignId}
          message={`${hostTeamNick} - ${startDate} - ${guestTeamNick}`}
          price={price}
        />
      ) : (
        <></>
      )
    },
  },
]

type TParams = {
  organizationSlug: string
}

type TData = {
  games: Game[]
  seasons: Season[]
}

const View: React.FC = () => {
  const { organizationSlug } = useParams<TParams>()

  const [selectedSeason, setSelectedSeason] =
    useLeagueSeasonState<Season | null>(null)

  const [gamesView, setGamesView] = useGamesViewState('all')
  const [gamesColumnsType, setGamesColumnsType] =
    useGamesColumnsTypeState('admin')
  const {
    error: errorGames,
    loading: loadingGames,
    data,
  } = useQuery<TData>(GET_GAMES, {
    variables: {
      whereGames: {
        org: {
          urlSlug: organizationSlug,
        },
        ...(selectedSeason?.status === 'RUNNING'
          ? {
              ...(gamesView === 'today' && {
                startDate: dayjs().format('YYYY-MM-DD'),
              }),
              ...(gamesView === 'past' && {
                startDate_GTE: selectedSeason?.startDate || null,
                startDate_LT: dayjs().format('YYYY-MM-DD'),
              }),
              ...(gamesView === 'future' && {
                startDate_GT: dayjs().format('YYYY-MM-DD'),
                startDate_LTE: selectedSeason?.endDate || null,
              }),
            }
          : {
              startDate_GTE: selectedSeason?.startDate || null,
              startDate_LTE: selectedSeason?.endDate || null,
            }),
      },
      whereGameEvents: {
        eventTypeCode: 'goal',
      },
      options: {
        sort: {
          startDate: 'ASC',
        },
      },
      whereSeasons: {
        org: {
          urlSlug: organizationSlug,
        },
      },
    },
  })

  const columns = React.useMemo(() => {
    const columnsBase = getColumns(organizationSlug)
    let cols
    let stopList: string[]
    switch (gamesColumnsType) {
      case 'admin':
        stopList = [
          'hostStar',
          'guestStar',
          'headline',
          'perex',
          'body',
          'flickrAlbum',
          'hostGoals',
          'guestGoals',
          'hostPenalties',
          'guestPenalties',
          'hostSaves',
          'guestSaves',
          'hostFaceOffs',
          'guestFaceOffs',
          'goalieGuest',
          'goalieHost',
          'GameQrPayment',
        ]
        cols = columnsBase.filter(c => !stopList.find(sl => sl === c.field))

        break
      case 'reporter':
        stopList = [
          'paymentHost',
          'paymentGuest',
          'paymentTimekeeper',
          'paymentReferee',
          'timekeeper',
          'referee',
          'description',
          'info',
          'name',
          'gameStatus',
          'foreignId',
          'hostGoals',
          'guestGoals',
          'hostPenalties',
          'guestPenalties',
          'hostSaves',
          'guestSaves',
          'hostFaceOffs',
          'guestFaceOffs',
          'GameQrPayment',
        ]
        cols = columnsBase.filter(c => !stopList.find(sl => sl === c.field))

        break
      case 'statistics':
        stopList = [
          'paymentHost',
          'paymentGuest',
          'paymentTimekeeper',
          'paymentReferee',
          'timekeeper',
          'referee',
          'headline',
          'perex',
          'body',
          'flickrAlbum',
          'description',
          'info',
          'name',
          'gameStatus',
          'foreignId',
          'GameQrPayment',
        ]

        cols = columnsBase.filter(c => !stopList.find(sl => sl === c.field))

        break
      default:
        cols = columnsBase
        break
    }
    return cols
  }, [organizationSlug, gamesColumnsType])

  const gameData = React.useMemo(() => {
    const preparedData = setIdFromEntityId(data?.games || [], 'gameId').map(
      (g: Game) => {
        const hostTeamName = g.teamsConnection?.edges?.find(
          (e: GameTeamsRelationship) => e.host
        )?.node?.name
        const guestTeamName = g.teamsConnection?.edges?.find(
          (e: GameTeamsRelationship) => !e.host
        )?.node?.name
        return { ...g, hostTeamName, guestTeamName }
      }
    )

    return preparedData
  }, [data])

  const searchIndexes = [
    'name',
    'description',
    'info',
    'foreignId',
    'referee',
    'startDate',
    'startTime',
    'timekeeper',
    'type',
    'hostTeamName',
    'guestTeamName',
    ['venue', 'name'],
    ['group', 'name'],
    ['group', 'competition', 'name'],
    ['phase', 'name'],
    ['phase', 'competition', 'name'],
  ]
  return (
    <XGridPage
      title="Games"
      loading={loadingGames}
      error={errorGames}
      columns={columns}
      rows={gameData}
      searchIndexes={searchIndexes}
    >
      <Stack gap={2} direction="column" sx={{ width: '100%' }}>
        <ButtonGroup aria-label="outlined button group" variant="outlined">
          {data?.seasons?.map(season => {
            return (
              <Button
                key={season.seasonId}
                type="button"
                color="primary"
                variant={
                  selectedSeason?.seasonId === season?.seasonId
                    ? 'contained'
                    : 'outlined'
                }
                onClick={() => {
                  setSelectedSeason(
                    season?.seasonId === selectedSeason?.seasonId
                      ? null
                      : season
                  )
                }}
              >
                {season?.name}
              </Button>
            )
          })}
        </ButtonGroup>

        <Stack direction="row" justifyContent="space-between">
          <div>
            <ButtonGroup
              variant="outlined"
              size="small"
              disabled={selectedSeason?.status !== 'RUNNING'}
            >
              <Button
                variant={gamesView === 'all' ? 'contained' : 'outlined'}
                onClick={() => {
                  setGamesView('all')
                }}
              >
                All
              </Button>
              <Button
                variant={gamesView === 'today' ? 'contained' : 'outlined'}
                onClick={() => {
                  setGamesView('today')
                }}
              >
                Today
              </Button>
              <Button
                variant={gamesView === 'past' ? 'contained' : 'outlined'}
                onClick={() => {
                  setGamesView('past')
                }}
              >
                Past
              </Button>
              <Button
                variant={gamesView === 'future' ? 'contained' : 'outlined'}
                onClick={() => {
                  setGamesView('future')
                }}
              >
                Future
              </Button>
            </ButtonGroup>
          </div>

          <div>
            <ButtonGroup variant="outlined" size="small">
              <Button
                variant={
                  gamesColumnsType === 'admin' ? 'contained' : 'outlined'
                }
                onClick={() => {
                  setGamesColumnsType('admin')
                }}
              >
                Admin
              </Button>
              <Button
                variant={
                  gamesColumnsType === 'reporter' ? 'contained' : 'outlined'
                }
                onClick={() => {
                  setGamesColumnsType('reporter')
                }}
              >
                Reporter
              </Button>
              <Button
                variant={
                  gamesColumnsType === 'statistics' ? 'contained' : 'outlined'
                }
                onClick={() => {
                  setGamesColumnsType('statistics')
                }}
              >
                Statistics
              </Button>
            </ButtonGroup>
          </div>

          <div>
            <LinkButton
              startIcon={<AddIcon />}
              to={getAdminOrgGameRoute(organizationSlug, 'new')}
            >
              Create
            </LinkButton>
          </div>
        </Stack>
      </Stack>
    </XGridPage>
  )
}

export { View as default }
