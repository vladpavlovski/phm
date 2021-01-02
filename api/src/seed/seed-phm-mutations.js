const fs = require('fs')
const { gql } = require('@apollo/client')
// const { data } = require('./seedData')
const parse = require('csv-parse/lib/sync')

export const getSeedMutations = () => {
  const fileContent = fs.readFileSync(__dirname + '/fake_data.csv')
  const records = parse(fileContent, { columns: true, delimiter: ';' })
  const mutations = generateMutations(records)

  return mutations
}

const generateMutations = (records) => {
  // console.log('records:', records)
  return records.map((rec) => {
    Object.keys(rec).map((k) => {
      if (k === 'playerName') {
        rec['playerFirstName'] = rec[k].split(' ')[0]
        rec['playerLastName'] = rec[k].split(' ')[1]
      } else if (k === 'playerInternalId') {
        rec[k] = parseInt(rec[k])
      } else if (k === 'playerBirthday') {
        const dateParts = rec[k].split('-')
        rec['playerBirthdayYear'] = parseInt(dateParts[0])
        rec['playerBirthdayMonth'] = parseInt(dateParts[1])
        rec['playerBirthdayDay'] = parseInt(dateParts[2])
      } else if (k === 'jerseyNoNumber') {
        rec[k] = parseInt(rec[k])
      }
    })
    console.log('rec: ', rec)
    return {
      mutation: gql`
        mutation createInit(
          $playerId: ID!
          $playerInternalId: Int
          $playerFirstName: String
          $playerLastName: String
          $teamId: ID!
          $teamName: String
          $teamFullName: String
          $teamNick: String
          $teamShortcut: String
          $teamPrimaryColor: String
          $teamSecondaryColor: String
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
            firstName: $playerFirstName
            lastName: $playerLastName
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
