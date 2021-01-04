const fs = require('fs')
const { gql } = require('@apollo/client')
const parse = require('csv-parse/lib/sync')

export const getSeedMutations = () => {
  const playersTeamsContent = fs.readFileSync(
    __dirname + '/fake_data_phm/players_teams-Table 1.csv'
  )
  const associationsContent = fs.readFileSync(
    __dirname + '/fake_data_phm/associations-Table 1.csv'
  )
  const playersTeams = parse(playersTeamsContent, {
    columns: true,
    delimiter: ';',
  })
  const associations = parse(associationsContent, {
    columns: true,
    delimiter: ';',
  })
  const mutations = generateMutations({ playersTeams, associations })

  return mutations
}

const generateMutations = (records) => {
  const playersTeams = records.playersTeams.map((rec) => {
    Object.keys(rec).map((k) => {
      if (k === 'playerInternalId') {
        rec[k] = parseInt(rec[k])
      } else if (k === 'playerBirthday') {
        const dateParts = rec[k].split('-')
        rec['playerBirthdayDay'] = parseInt(dateParts[0])
        rec['playerBirthdayMonth'] = parseInt(dateParts[1])
        rec['playerBirthdayYear'] = parseInt(dateParts[2])
      } else if (k === 'jerseyNoNumber') {
        rec[k] = parseInt(rec[k])
      } else if (k === 'teamManagerBirthday') {
        const dateParts = rec[k].split('-')
        rec['teamManagerBirthdayDay'] = parseInt(dateParts[0])
        rec['teamManagerBirthdayMonth'] = parseInt(dateParts[1])
        rec['teamManagerBirthdayYear'] = parseInt(dateParts[2])
      } else if (k === 'teamManagerInternalId') {
        rec[k] = parseInt(rec[k])
      }
    })
    console.log('rec: ', rec)
    return {
      mutation: gql`
        mutation createInit(
          $playerId: ID!
          $playerInternalId: Int
          $playerName: String
          $playerBirthdayYear: Int
          $playerBirthdayMonth: Int
          $playerBirthdayDay: Int
          $playerIsActive: ActivityStatus
          $playerCountry: String
          $playerCity: String
          $playerStick: String
          $playerHeight: String
          $playerWeight: String
          $playerGender: String
          $teamId: ID!
          $teamName: String
          $teamFullName: String
          $teamNick: String
          $teamShortcut: String
          $teamPrimaryColor: String
          $teamSecondaryColor: String
          $teamManagerId: ID!
          $teamManagerName: String
          $teamManagerGender: String
          $teamManagerInternalId: Int
          $teamManagerIsActive: ActivityStatus
          $teamManagerBirthdayYear: Int
          $teamManagerBirthdayMonth: Int
          $teamManagerBirthdayDay: Int
          $positionId: ID!
          $positionName: String
          $positionDescription: String
          $jerseyNoId: ID!
          $jerseyNoNumber: Int
          $wearItemId: ID!
          $wearItemName: String
          $wearId: ID!
          $wearName: String
        ) {
          player: MergePlayer(
            playerId: $playerId
            name: $playerName
            internalId: $playerInternalId
            birthday: {
              year: $playerBirthdayYear
              month: $playerBirthdayMonth
              day: $playerBirthdayDay
            }
            isActive: $playerIsActive
            country: $playerCountry
            city: $playerCity
            stick: $playerStick
            height: $playerHeight
            weight: $playerWeight
            gender: $playerGender
          ) {
            playerId
          }
          position: MergePosition(
            positionId: $positionId
            name: $positionName
            description: $positionDescription
          ) {
            positionId
          }
          playerPosition: MergePositionPlayers(
            from: { playerId: $playerId }
            to: { positionId: $positionId }
          ) {
            from {
              playerId
            }
          }
          team: MergeTeam(
            teamId: $teamId
            name: $teamName
            fullName: $teamFullName
            shortcut: $teamShortcut
            primaryColor: $teamPrimaryColor
            secondaryColor: $teamSecondaryColor
            nick: $teamNick
          ) {
            teamId
          }
          teamManager: MergeStaff(
            staffId: $teamManagerId
            name: $teamManagerName
            gender: $teamManagerGender
            internalId: $teamManagerInternalId
            isActive: $teamManagerIsActive
            birthday: {
              year: $teamManagerBirthdayYear
              month: $teamManagerBirthdayMonth
              day: $teamManagerBirthdayDay
            }
          ) {
            staffId
          }
          staffTeamManager: MergeStaffTeamManager(
            from: { teamId: $teamId }
            to: { staffId: $teamManagerId }
          ) {
            from {
              teamId
            }
          }
          playerTeam: MergePlayerTeams(
            from: { playerId: $playerId }
            to: { teamId: $teamId }
          ) {
            from {
              playerId
            }
          }
          teamPosition: MergePositionTeam(
            from: { teamId: $teamId }
            to: { positionId: $positionId }
          ) {
            from {
              teamId
            }
          }
          jerseyNo: MergeJerseyNo(
            jerseyNoId: $jerseyNoId
            number: $jerseyNoNumber
          ) {
            jerseyNoId
          }
          playerJerseyNo: MergeJerseyNoPlayer(
            from: { playerId: $playerId }
            to: { jerseyNoId: $jerseyNoId }
          ) {
            from {
              playerId
            }
          }
          teamJerseyNo: MergeJerseyNoTeam(
            from: { teamId: $teamId }
            to: { jerseyNoId: $jerseyNoId }
          ) {
            from {
              teamId
            }
          }
          wearItem: MergeWearItem(
            wearItemId: $wearItemId
            name: $wearItemName
          ) {
            wearItemId
          }
          wearJerseyNo: MergeWearItemJerseyNo(
            from: { jerseyNoId: $jerseyNoId }
            to: { wearItemId: $wearItemId }
          ) {
            from {
              jerseyNoId
            }
          }
          wear: MergeWear(wearId: $wearId, name: $wearName) {
            wearId
          }
          wearWearItem: MergeWearItemWear(
            from: { wearId: $wearId }
            to: { wearItemId: $wearItemId }
          ) {
            from {
              wearId
            }
          }
          wearTeam: MergeWearTeam(
            from: { teamId: $teamId }
            to: { wearId: $wearId }
          ) {
            from {
              teamId
            }
          }
        }
      `,
      variables: rec,
    }
  })

  const associations = records.associations.map((rec) => {
    Object.keys(rec).map((k) => {
      if (k === 'associationManagerInternalId') {
        rec[k] = parseInt(rec[k])
      } else if (k === 'associationManagerBirthday') {
        const dateParts = rec[k].split('-')
        rec['associationManagerBirthdayDay'] = parseInt(dateParts[0])
        rec['associationManagerBirthdayMonth'] = parseInt(dateParts[1])
        rec['associationManagerBirthdayYear'] = parseInt(dateParts[2])
      } else if (k === 'competitionPhaseStartDate') {
        const dateParts = rec[k].split('-')
        rec['competitionPhaseStartDateDay'] = parseInt(dateParts[0])
        rec['competitionPhaseStartDateMonth'] = parseInt(dateParts[1])
        rec['competitionPhaseStartDateYear'] = parseInt(dateParts[2])
      } else if (k === 'competitionPhaseEndDate') {
        const dateParts = rec[k].split('-')
        rec['competitionPhaseEndDateDay'] = parseInt(dateParts[0])
        rec['competitionPhaseEndDateMonth'] = parseInt(dateParts[1])
        rec['competitionPhaseEndDateYear'] = parseInt(dateParts[2])
      } else if (k === 'competitionSeasonStartDate') {
        const dateParts = rec[k].split('-')
        rec['competitionSeasonStartDateDay'] = parseInt(dateParts[0])
        rec['competitionSeasonStartDateMonth'] = parseInt(dateParts[1])
        rec['competitionSeasonStartDateYear'] = parseInt(dateParts[2])
      } else if (k === 'competitionSeasonEndDate') {
        const dateParts = rec[k].split('-')
        rec['competitionSeasonEndDateDay'] = parseInt(dateParts[0])
        rec['competitionSeasonEndDateMonth'] = parseInt(dateParts[1])
        rec['competitionSeasonEndDateYear'] = parseInt(dateParts[2])
      }
    })
    console.log('rec: ', rec)

    return {
      mutation: gql`
        mutation createAssociations(
          $associationId: ID!
          $associationName: String
          $associationManagerId: ID!
          $associationManagerInternalId: Int
          $associationManagerName: String
          $associationManagerBirthdayDay: Int
          $associationManagerBirthdayMonth: Int
          $associationManagerBirthdayYear: Int
          $competitionId: ID!
          $competitionName: String
          $competitionIsActive: String
          $competitionManagerId: ID!
          $competitionManagerName: String
          $competitionPhaseId: ID!
          $competitionPhaseName: String
          $competitionPhaseStartDateDay: Int
          $competitionPhaseStartDateMonth: Int
          $competitionPhaseStartDateYear: Int
          $competitionPhaseEndDateDay: Int
          $competitionPhaseEndDateMonth: Int
          $competitionPhaseEndDateYear: Int
          $competitionPhaseStatus: String
          $competitionGroupId: ID!
          $competitionGroupName: String
          $competitionSeasonId: ID!
          $competitionSeasonName: String
          $competitionSeasonStartDateDay: Int
          $competitionSeasonStartDateMonth: Int
          $competitionSeasonStartDateYear: Int
          $competitionSeasonEndDateDay: Int
          $competitionSeasonEndDateMonth: Int
          $competitionSeasonEndDateYear: Int
          $competitionVenueId: ID!
          $competitionVenueName: String
          $competitionVenueWeb: String
          $competitionVenueDescription: String
        ) {
          association: MergeAssociation(
            associationId: $associationId
            name: $associationName
          ) {
            associationId
          }
          associationManager: MergeStaff(
            staffId: $associationManagerId
            name: $associationManagerName
            internalId: $associationManagerInternalId
            birthday: {
              year: $associationManagerBirthdayYear
              month: $associationManagerBirthdayMonth
              day: $associationManagerBirthdayDay
            }
          ) {
            staffId
          }
          associationAssociationManager: MergeAssociationManager(
            from: { associationId: $associationId }
            to: { staffId: $associationManagerId }
          ) {
            from {
              associationId
            }
          }
          competition: MergeCompetition(
            competitionId: $competitionId
            name: $competitionName
            isActive: $competitionIsActive
          ) {
            competitionId
          }
          competitionManager: MergeStaff(
            staffId: $competitionManagerId
            name: $competitionManagerName
          ) {
            staffId
          }
          competitionCompetitionManager: MergeCompetitionManagers(
            from: { competitionId: $competitionId }
            to: { staffId: $competitionManagerId }
          ) {
            from {
              competitionId
            }
          }
          competitionAssociation: MergeCompetitionAssociation(
            from: { competitionId: $competitionId }
            to: { associationId: $associationId }
          ) {
            from {
              competitionId
            }
          }
          competitionPhase: MergePhase(
            phaseId: $competitionPhaseId
            name: $competitionPhaseName
            startDate: {
              year: $competitionPhaseStartDateYear
              month: $competitionPhaseStartDateMonth
              day: $competitionPhaseStartDateDay
            }
            endDate: {
              year: $competitionPhaseEndDateYear
              month: $competitionPhaseEndDateMonth
              day: $competitionPhaseEndDateDay
            }
            status: $competitionPhaseStatus
          ) {
            phaseId
          }
          competitionCompetitionPhase: MergePhaseCompetition(
            from: { competitionId: $competitionId }
            to: { phaseId: $competitionPhaseId }
          ) {
            from {
              competitionId
            }
          }
          competitionGroup: MergeGroup(
            groupId: $competitionGroupId
            name: $competitionGroupName
          ) {
            groupId
          }
          competitionCompetitionGroup: MergeGroupCompetition(
            from: { competitionId: $competitionId }
            to: { groupId: $competitionGroupId }
          ) {
            from {
              competitionId
            }
          }
          competitionSeason: MergeSeason(
            seasonId: $competitionSeasonId
            name: $competitionSeasonName
            startDate: {
              year: $competitionSeasonStartDateYear
              month: $competitionSeasonStartDateMonth
              day: $competitionSeasonStartDateDay
            }
            endDate: {
              year: $competitionSeasonEndDateYear
              month: $competitionSeasonEndDateMonth
              day: $competitionSeasonEndDateDay
            }
          ) {
            seasonId
          }
          competitionCompetitionSeason: MergeSeasonCompetition(
            from: { competitionId: $competitionId }
            to: { seasonId: $competitionSeasonId }
          ) {
            from {
              competitionId
            }
          }
          competitionVenue: MergeVenue(
            venueId: $competitionVenueId
            name: $competitionVenueName
            web: $competitionVenueWeb
            description: $competitionVenueDescription
          ) {
            venueId
          }
        }
      `,
      variables: rec,
    }
  })

  const result = playersTeams.concat(associations)

  return result
}
