const fs = require('fs')
const { gql } = require('@apollo/client')
const parse = require('csv-parse/lib/sync')

export const getSeedMutations = () => {
  const playersTeamsContent = fs.readFileSync(__dirname + '/players_teams.csv')
  const playersTeams = parse(playersTeamsContent, {
    columns: true,
    delimiter: ';',
  })
  const mutations = generateMutations({ playersTeams })

  return mutations
}

const generateMutations = (records) => {
  // console.log('records:', records)
  return records.playersTeams.map((rec) => {
    Object.keys(rec).map((k) => {
      if (k === 'playerInternalId') {
        rec[k] = parseInt(rec[k])
      } else if (k === 'playerBirthday') {
        const dateParts = rec[k].split('-')
        rec['playerBirthdayYear'] = parseInt(dateParts[0])
        rec['playerBirthdayMonth'] = parseInt(dateParts[1])
        rec['playerBirthdayDay'] = parseInt(dateParts[2])
      } else if (k === 'jerseyNoNumber') {
        rec[k] = parseInt(rec[k])
      } else if (k === 'teamManagerBirthday') {
        const dateParts = rec[k].split('-')
        rec['teamManagerBirthdayYear'] = parseInt(dateParts[0])
        rec['teamManagerBirthdayMonth'] = parseInt(dateParts[1])
        rec['teamManagerBirthdayDay'] = parseInt(dateParts[2])
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
}
