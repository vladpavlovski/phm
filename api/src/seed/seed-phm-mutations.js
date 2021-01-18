const fs = require('fs')
const { gql } = require('@apollo/client')
const parse = require('csv-parse/lib/sync')

export const getSeedMutations = () => {
  const sponsorsContent = fs.readFileSync(
    __dirname + '/fake_data_phm/PHM NEW DB import - Sponsors.csv'
  )
  const sponsors = parse(sponsorsContent, {
    columns: true,
    delimiter: ',',
  })
  const venuesContent = fs.readFileSync(
    __dirname + '/fake_data_phm/PHM NEW DB import - Venues.csv'
  )
  const venues = parse(venuesContent, {
    columns: true,
    delimiter: ',',
  })

  const associationsContent = fs.readFileSync(
    __dirname + '/fake_data_phm/PHM NEW DB import - Association.csv'
  )
  const associations = parse(associationsContent, {
    columns: true,
    delimiter: ',',
  })

  const competitionsContent = fs.readFileSync(
    __dirname + '/fake_data_phm/PHM NEW DB import - Competitions.csv'
  )
  const competitions = parse(competitionsContent, {
    columns: true,
    delimiter: ',',
  })

  const seasonsContent = fs.readFileSync(
    __dirname + '/fake_data_phm/PHM NEW DB import - Seasons.csv'
  )
  const seasons = parse(seasonsContent, {
    columns: true,
    delimiter: ',',
  })

  const phasesContent = fs.readFileSync(
    __dirname + '/fake_data_phm/PHM NEW DB import - Phases.csv'
  )
  const phases = parse(phasesContent, {
    columns: true,
    delimiter: ',',
  })

  const groupsContent = fs.readFileSync(
    __dirname + '/fake_data_phm/PHM NEW DB import - Groups.csv'
  )
  const groups = parse(groupsContent, {
    columns: true,
    delimiter: ',',
  })

  const awardsContent = fs.readFileSync(
    __dirname + '/fake_data_phm/PHM NEW DB import - Awards.csv'
  )
  const awards = parse(awardsContent, {
    columns: true,
    delimiter: ',',
  })

  const teamsContent = fs.readFileSync(
    __dirname + '/fake_data_phm/PHM NEW DB import - Teams.csv'
  )
  const teams = parse(teamsContent, {
    columns: true,
    delimiter: ',',
  })

  const mutations = generateMutations({
    sponsors,
    venues,
    associations,
    competitions,
    seasons,
    phases,
    groups,
    awards,
    teams,
  })

  return mutations
}

const generateMutations = records => {
  const sponsors = records.sponsors.map(rec => {
    return {
      mutation: gql`
        mutation createSponsor(
          $sponsorId: ID!
          $sponsorName: String
          $sponsorNick: String
          $sponsorShort: String
          $sponsorClaim: String
          $sponsorWeb: String
          $sponsorLegalName: String
        ) {
          sponsor: MergeSponsor(
            sponsorId: $sponsorId
            name: $sponsorName
            nick: $sponsorNick
            short: $sponsorShort
            claim: $sponsorClaim
            web: $sponsorWeb
            legalName: $sponsorLegalName
          ) {
            sponsorId
          }
        }
      `,
      variables: rec,
    }
  })

  const venues = records.venues.map(rec => {
    Object.keys(rec).map(k => {
      if (k === 'venueCapacity') {
        rec[k] = parseInt(rec[k])
      } else if (k === 'venueFoundDate') {
        const dateParts = rec[k].split('.')
        rec['venueFoundDateDay'] = parseInt(dateParts[0])
        rec['venueFoundDateMonth'] = parseInt(dateParts[1])
        rec['venueFoundDateYear'] = parseInt(dateParts[2])
      }
    })

    return {
      mutation: gql`
        mutation createVenue(
          $venueId: ID!
          $venueName: String
          $venueNick: String
          $venueShort: String
          $venueFoundDateDay: Int
          $venueFoundDateMonth: Int
          $venueFoundDateYear: Int
          $venueLocation: String
          $venueWeb: String
          $venueDescription: String
          $venueCapacity: Int
          $competitionName: String
          $competitionId: ID!
        ) {
          venue: MergeVenue(
            venueId: $venueId
            name: $venueName
            nick: $venueNick
            short: $venueShort
            location: $venueLocation
            foundDate: {
              day: $venueFoundDateDay
              month: $venueFoundDateMonth
              year: $venueFoundDateYear
            }
            web: $venueWeb
            description: $venueDescription
            capacity: $venueCapacity
          ) {
            venueId
          }
          competition: MergeCompetition(
            competitionId: $competitionId
            name: $competitionName
          ) {
            competitionId
          }
          venueCompetition: MergeCompetitionVenue(
            from: { competitionId: $competitionId }
            to: { venueId: $venueId }
          ) {
            from {
              competitionId
            }
          }
        }
      `,
      variables: rec,
    }
  })

  const associations = records.associations.map(rec => {
    Object.keys(rec).map(k => {
      if (k === 'associationFoundDate') {
        const dateParts = rec[k].split('.')
        rec['associationFoundDateDay'] = parseInt(dateParts[0])
        rec['associationFoundDateMonth'] = parseInt(dateParts[1])
        rec['associationFoundDateYear'] = parseInt(dateParts[2])
      }
    })
    return {
      mutation: gql`
        mutation createAssociations(
          $associationId: ID!
          $associationName: String
          $associationNick: String
          $associationShort: String
          $associationStatus: String
          $associationLegalName: String
          $associationFoundDateDay: Int
          $associationFoundDateMonth: Int
          $associationFoundDateYear: Int
        ) {
          association: MergeAssociation(
            associationId: $associationId
            name: $associationName
            nick: $associationNick
            short: $associationShort
            status: $associationStatus
            legalName: $associationLegalName
            foundDate: {
              day: $associationFoundDateDay
              month: $associationFoundDateMonth
              year: $associationFoundDateYear
            }
          ) {
            associationId
          }
        }
      `,
      variables: rec,
    }
  })

  const competitions = records.competitions.map(rec => {
    Object.keys(rec).map(k => {
      if (k === 'competitionFoundDate') {
        const dateParts = rec[k].split('.')
        rec['competitionFoundDateDay'] = parseInt(dateParts[0])
        rec['competitionFoundDateMonth'] = parseInt(dateParts[1])
        rec['competitionFoundDateYear'] = parseInt(dateParts[2])
      }
    })
    return {
      mutation: gql`
        mutation createCompetitions(
          $competitionId: ID!
          $competitionName: String
          $competitionNick: String
          $competitionShort: String
          $competitionStatus: String
          $competitionFoundDateDay: Int
          $competitionFoundDateMonth: Int
          $competitionFoundDateYear: Int
          $associationId: ID!
          $sponsorId: ID!
        ) {
          competition: MergeCompetition(
            competitionId: $competitionId
            name: $competitionName
            nick: $competitionNick
            short: $competitionShort
            status: $competitionStatus
            foundDate: {
              day: $competitionFoundDateDay
              month: $competitionFoundDateMonth
              year: $competitionFoundDateYear
            }
          ) {
            competitionId
          }
          competitionAssociation: MergeCompetitionAssociation(
            from: { competitionId: $competitionId }
            to: { associationId: $associationId }
          ) {
            from {
              competitionId
            }
          }
          competitionSponsor: MergeCompetitionSponsors(
            from: { competitionId: $competitionId }
            to: { sponsorId: $sponsorId }
          ) {
            from {
              competitionId
            }
          }
        }
      `,
      variables: rec,
    }
  })

  const seasons = records.seasons.map(rec => {
    Object.keys(rec).map(k => {
      if (k === 'seasonStartDate') {
        const dateParts = rec[k].split('.')
        rec['seasonStartDateDay'] = parseInt(dateParts[0])
        rec['seasonStartDateMonth'] = parseInt(dateParts[1])
        rec['seasonStartDateYear'] = parseInt(dateParts[2])
      } else if (k === 'seasonEndDate') {
        const dateParts = rec[k].split('.')
        rec['seasonEndDateDay'] = parseInt(dateParts[0])
        rec['seasonEndDateMonth'] = parseInt(dateParts[1])
        rec['seasonEndDateYear'] = parseInt(dateParts[2])
      }
    })
    // console.log('season: ', rec)
    return {
      mutation: gql`
        mutation createSeasons(
          $seasonId: ID!
          $seasonName: String
          $seasonNick: String
          $seasonShort: String
          $seasonStartDateDay: Int
          $seasonStartDateMonth: Int
          $seasonStartDateYear: Int
          $seasonEndDateDay: Int
          $seasonEndDateMonth: Int
          $seasonEndDateYear: Int
          $competitionId: ID!
          $competitionName: String
          $venueId: ID!
          $venueName: String
        ) {
          season: MergeSeason(
            seasonId: $seasonId
            name: $seasonName
            nick: $seasonNick
            short: $seasonShort
            startDate: {
              day: $seasonStartDateDay
              month: $seasonStartDateMonth
              year: $seasonStartDateYear
            }
            endDate: {
              day: $seasonEndDateDay
              month: $seasonEndDateMonth
              year: $seasonEndDateYear
            }
          ) {
            seasonId
          }
          competition: MergeCompetition(
            competitionId: $competitionId
            name: $competitionName
          ) {
            competitionId
          }
          seasonCompetition: MergeSeasonCompetition(
            from: { competitionId: $competitionId }
            to: { seasonId: $seasonId }
          ) {
            from {
              competitionId
            }
          }
          venue: MergeVenue(venueId: $venueId, name: $venueName) {
            venueId
          }
          seasonVenue: MergeSeasonVenue(
            from: { seasonId: $seasonId }
            to: { venueId: $venueId }
          ) {
            from {
              seasonId
            }
          }
        }
      `,
      variables: rec,
    }
  })

  const phases = records.phases.map(rec => {
    Object.keys(rec).map(k => {
      if (k === 'phaseStartDate') {
        const dateParts = rec[k].split('.')
        rec['phaseStartDateDay'] = parseInt(dateParts[0])
        rec['phaseStartDateMonth'] = parseInt(dateParts[1])
        rec['phaseStartDateYear'] = parseInt(dateParts[2])
      } else if (k === 'phaseEndDate') {
        const dateParts = rec[k].split('.')
        rec['phaseEndDateDay'] = parseInt(dateParts[0])
        rec['phaseEndDateMonth'] = parseInt(dateParts[1])
        rec['phaseEndDateYear'] = parseInt(dateParts[2])
      }
    })
    // console.log(rec)
    return {
      mutation: gql`
        mutation createPhases(
          $phaseId: ID!
          $phaseName: String
          $phaseNick: String
          $phaseShort: String
          $phaseStatus: String
          $phaseStartDateDay: Int
          $phaseStartDateMonth: Int
          $phaseStartDateYear: Int
          $phaseEndDateDay: Int
          $phaseEndDateMonth: Int
          $phaseEndDateYear: Int
          $competitionId: ID!
          $competitionName: String
          $sponsorId: ID!
          $sponsorName: String
          $seasonId: ID!
          $venueId: ID!
        ) {
          phase: MergePhase(
            phaseId: $phaseId
            name: $phaseName
            nick: $phaseNick
            short: $phaseShort
            status: $phaseStatus
            startDate: {
              day: $phaseStartDateDay
              month: $phaseStartDateMonth
              year: $phaseStartDateYear
            }
            endDate: {
              day: $phaseEndDateDay
              month: $phaseEndDateMonth
              year: $phaseEndDateYear
            }
          ) {
            phaseId
          }
          competition: MergeCompetition(
            competitionId: $competitionId
            name: $competitionName
          ) {
            competitionId
          }
          phaseCompetition: MergePhaseCompetition(
            from: { competitionId: $competitionId }
            to: { phaseId: $phaseId }
          ) {
            from {
              competitionId
            }
          }
          sponsor: MergeSponsor(sponsorId: $sponsorId, name: $sponsorName) {
            sponsorId
          }
          phaseSponsor: MergePhaseSponsors(
            from: { phaseId: $phaseId }
            to: { sponsorId: $sponsorId }
          ) {
            from {
              phaseId
            }
          }
          phaseSeason: MergePhaseSeason(
            from: { phaseId: $phaseId }
            to: { seasonId: $seasonId }
          ) {
            from {
              phaseId
            }
          }
          phaseVenue: MergePhaseVenues(
            from: { phaseId: $phaseId }
            to: { venueId: $venueId }
          ) {
            from {
              phaseId
            }
          }
        }
      `,
      variables: rec,
    }
  })

  const groups = records.groups.map(rec => {
    Object.keys(rec).map(k => {
      if (k === 'groupTeamsLimit') {
        rec[k] = parseInt(rec[k])
      }
    })
    return {
      mutation: gql`
        mutation createGroups(
          $groupId: ID!
          $groupName: String
          $groupNick: String
          $groupShort: String
          $groupTeamsLimit: Int
          $phaseId: ID!
          $competitionId: ID!
          $competitionName: String
          $sponsorId: ID!
          $sponsorName: String
          $seasonId: ID!
          $venueId: ID!
        ) {
          group: MergeGroup(
            groupId: $groupId
            name: $groupName
            nick: $groupNick
            short: $groupShort
            teamsLimit: $groupTeamsLimit
          ) {
            groupId
          }
          competition: MergeCompetition(
            competitionId: $competitionId
            name: $competitionName
          ) {
            competitionId
          }
          groupCompetition: MergeGroupCompetition(
            from: { competitionId: $competitionId }
            to: { groupId: $groupId }
          ) {
            from {
              competitionId
            }
          }
          sponsor: MergeSponsor(sponsorId: $sponsorId, name: $sponsorName) {
            sponsorId
          }
          groupSponsor: MergeGroupSponsors(
            from: { groupId: $groupId }
            to: { sponsorId: $sponsorId }
          ) {
            from {
              groupId
            }
          }
          groupSeason: MergeGroupSeason(
            from: { groupId: $groupId }
            to: { seasonId: $seasonId }
          ) {
            from {
              groupId
            }
          }
          groupVenue: MergeGroupVenue(
            from: { groupId: $groupId }
            to: { venueId: $venueId }
          ) {
            from {
              groupId
            }
          }
          groupPhase: MergeGroupPhase(
            from: { groupId: $groupId }
            to: { phaseId: $phaseId }
          ) {
            from {
              groupId
            }
          }
        }
      `,
      variables: rec,
    }
  })

  const awards = records.awards.map(rec => {
    return {
      mutation: gql`
        mutation createAwards(
          $awardId: ID!
          $awardName: String
          $awardNick: String
          $awardShort: String
          $awardDescription: String
          $awardType: String
          $phaseId: ID!
          $competitionId: ID!
          $competitionName: String
          $sponsorId: ID!
          $sponsorName: String
          $groupId: ID!
        ) {
          award: MergeAward(
            awardId: $awardId
            name: $awardName
            nick: $awardNick
            short: $awardShort
            description: $awardDescription
            type: $awardType
          ) {
            awardId
          }
          competition: MergeCompetition(
            competitionId: $competitionId
            name: $competitionName
          ) {
            competitionId
          }
          awardCompetition: MergeAwardCompetitions(
            from: { awardId: $awardId }
            to: { competitionId: $competitionId }
          ) {
            from {
              awardId
            }
          }
          sponsor: MergeSponsor(sponsorId: $sponsorId, name: $sponsorName) {
            sponsorId
          }
          awardSponsor: MergeAwardSponsors(
            from: { awardId: $awardId }
            to: { sponsorId: $sponsorId }
          ) {
            from {
              awardId
            }
          }
          awardPhase: MergeAwardPhases(
            from: { awardId: $awardId }
            to: { phaseId: $phaseId }
          ) {
            from {
              awardId
            }
          }
          awardGroup: MergeAwardGroups(
            from: { awardId: $awardId }
            to: { groupId: $groupId }
          ) {
            from {
              awardId
            }
          }
        }
      `,
      variables: rec,
    }
  })

  const teams = records.teams.map(rec => {
    return {
      mutation: gql`
        mutation createTeams(
          $teamId: ID!
          $teamName: String
          $teamNick: String
          $teamShort: String
          $teamStatus: String
          $teamExternalId: String
          $teamLogoUrl: String
          $competitionId: ID!
          $competitionName: String
          $sponsorId: ID!
          $sponsorName: String
          $phaseId: ID!
          $phaseName: String
          $groupId: ID!
          $groupName: String
          $seasonId: ID!
          $seasonName: String
        ) {
          team: MergeTeam(
            teamId: $teamId
            name: $teamName
            nick: $teamNick
            short: $teamShort
            status: $teamStatus
            externalId: $teamExternalId
            logoUrl: $teamLogoUrl
          ) {
            teamId
          }
          competition: MergeCompetition(
            competitionId: $competitionId
            name: $competitionName
          ) {
            competitionId
          }
          teamCompetition: MergeTeamCompetitions(
            from: { teamId: $teamId }
            to: { competitionId: $competitionId }
          ) {
            from {
              teamId
            }
          }
          sponsor: MergeSponsor(sponsorId: $sponsorId, name: $sponsorName) {
            sponsorId
          }
          teamSponsor: MergeTeamSponsors(
            from: { teamId: $teamId }
            to: { sponsorId: $sponsorId }
          ) {
            from {
              teamId
            }
          }
          phase: MergePhase(phaseId: $phaseId, name: $phaseName) {
            phaseId
          }
          teamPhase: MergeTeamPhases(
            from: { teamId: $teamId }
            to: { phaseId: $phaseId }
          ) {
            from {
              teamId
            }
          }
          group: MergeGroup(groupId: $groupId, name: $groupName) {
            groupId
          }
          teamGroup: MergeTeamGroups(
            from: { teamId: $teamId }
            to: { groupId: $groupId }
          ) {
            from {
              teamId
            }
          }
          season: MergeSeason(seasonId: $seasonId, name: $seasonName) {
            seasonId
          }
          teamSeason: MergeTeamSeasons(
            from: { teamId: $teamId }
            to: { seasonId: $seasonId }
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

  // const playersTeams = records.playersTeams.map(rec => {
  //   Object.keys(rec).map(k => {
  //     if (k === 'playerInternalId') {
  //       rec[k] = parseInt(rec[k])
  //     } else if (k === 'playerBirthday') {
  //       const dateParts = rec[k].split('-')
  //       rec['playerBirthdayDay'] = parseInt(dateParts[0])
  //       rec['playerBirthdayMonth'] = parseInt(dateParts[1])
  //       rec['playerBirthdayYear'] = parseInt(dateParts[2])
  //     } else if (k === 'jerseyNoNumber') {
  //       rec[k] = parseInt(rec[k])
  //     } else if (k === 'teamManagerBirthday') {
  //       const dateParts = rec[k].split('-')
  //       rec['teamManagerBirthdayDay'] = parseInt(dateParts[0])
  //       rec['teamManagerBirthdayMonth'] = parseInt(dateParts[1])
  //       rec['teamManagerBirthdayYear'] = parseInt(dateParts[2])
  //     } else if (k === 'teamManagerInternalId') {
  //       rec[k] = parseInt(rec[k])
  //     }
  //   })
  //   console.log('rec: ', rec)
  //   return {
  //     mutation: gql`
  //       mutation createInit(
  //         $playerId: ID!
  //         $playerInternalId: Int
  //         $playerName: String
  //         $playerBirthdayYear: Int
  //         $playerBirthdayMonth: Int
  //         $playerBirthdayDay: Int
  //         $playerIsActive: ActivityStatus
  //         $playerCountry: String
  //         $playerCity: String
  //         $playerStick: String
  //         $playerHeight: String
  //         $playerWeight: String
  //         $playerGender: String
  //         $teamId: ID!
  //         $teamName: String
  //         $teamFullName: String
  //         $teamNick: String
  //         $teamShortcut: String
  //         $teamPrimaryColor: String
  //         $teamSecondaryColor: String
  //         $teamManagerId: ID!
  //         $teamManagerName: String
  //         $teamManagerGender: String
  //         $teamManagerInternalId: Int
  //         $teamManagerIsActive: ActivityStatus
  //         $teamManagerBirthdayYear: Int
  //         $teamManagerBirthdayMonth: Int
  //         $teamManagerBirthdayDay: Int
  //         $positionId: ID!
  //         $positionName: String
  //         $positionDescription: String
  //         $jerseyNoId: ID!
  //         $jerseyNoNumber: Int
  //         $wearItemId: ID!
  //         $wearItemName: String
  //         $wearId: ID!
  //         $wearName: String
  //       ) {
  //         player: MergePlayer(
  //           playerId: $playerId
  //           name: $playerName
  //           internalId: $playerInternalId
  //           birthday: {
  //             year: $playerBirthdayYear
  //             month: $playerBirthdayMonth
  //             day: $playerBirthdayDay
  //           }
  //           isActive: $playerIsActive
  //           country: $playerCountry
  //           city: $playerCity
  //           stick: $playerStick
  //           height: $playerHeight
  //           weight: $playerWeight
  //           gender: $playerGender
  //         ) {
  //           playerId
  //         }
  //         position: MergePosition(
  //           positionId: $positionId
  //           name: $positionName
  //           description: $positionDescription
  //         ) {
  //           positionId
  //         }
  //         playerPosition: MergePositionPlayers(
  //           from: { playerId: $playerId }
  //           to: { positionId: $positionId }
  //         ) {
  //           from {
  //             playerId
  //           }
  //         }
  //         team: MergeTeam(
  //           teamId: $teamId
  //           name: $teamName
  //           fullName: $teamFullName
  //           shortcut: $teamShortcut
  //           primaryColor: $teamPrimaryColor
  //           secondaryColor: $teamSecondaryColor
  //           nick: $teamNick
  //         ) {
  //           teamId
  //         }
  //         teamManager: MergeStaff(
  //           staffId: $teamManagerId
  //           name: $teamManagerName
  //           gender: $teamManagerGender
  //           internalId: $teamManagerInternalId
  //           isActive: $teamManagerIsActive
  //           birthday: {
  //             year: $teamManagerBirthdayYear
  //             month: $teamManagerBirthdayMonth
  //             day: $teamManagerBirthdayDay
  //           }
  //         ) {
  //           staffId
  //         }
  //         staffTeamManager: MergeStaffTeamManager(
  //           from: { teamId: $teamId }
  //           to: { staffId: $teamManagerId }
  //         ) {
  //           from {
  //             teamId
  //           }
  //         }
  //         playerTeam: MergePlayerTeams(
  //           from: { playerId: $playerId }
  //           to: { teamId: $teamId }
  //         ) {
  //           from {
  //             playerId
  //           }
  //         }
  //         teamPosition: MergePositionTeam(
  //           from: { teamId: $teamId }
  //           to: { positionId: $positionId }
  //         ) {
  //           from {
  //             teamId
  //           }
  //         }
  //         jerseyNo: MergeJerseyNo(
  //           jerseyNoId: $jerseyNoId
  //           number: $jerseyNoNumber
  //         ) {
  //           jerseyNoId
  //         }
  //         playerJerseyNo: MergeJerseyNoPlayer(
  //           from: { playerId: $playerId }
  //           to: { jerseyNoId: $jerseyNoId }
  //         ) {
  //           from {
  //             playerId
  //           }
  //         }
  //         teamJerseyNo: MergeJerseyNoTeam(
  //           from: { teamId: $teamId }
  //           to: { jerseyNoId: $jerseyNoId }
  //         ) {
  //           from {
  //             teamId
  //           }
  //         }
  //         wearItem: MergeWearItem(
  //           wearItemId: $wearItemId
  //           name: $wearItemName
  //         ) {
  //           wearItemId
  //         }
  //         wearJerseyNo: MergeWearItemJerseyNo(
  //           from: { jerseyNoId: $jerseyNoId }
  //           to: { wearItemId: $wearItemId }
  //         ) {
  //           from {
  //             jerseyNoId
  //           }
  //         }
  //         wear: MergeWear(wearId: $wearId, name: $wearName) {
  //           wearId
  //         }
  //         wearWearItem: MergeWearItemWear(
  //           from: { wearId: $wearId }
  //           to: { wearItemId: $wearItemId }
  //         ) {
  //           from {
  //             wearId
  //           }
  //         }
  //         wearTeam: MergeWearTeam(
  //           from: { teamId: $teamId }
  //           to: { wearId: $wearId }
  //         ) {
  //           from {
  //             teamId
  //           }
  //         }
  //       }
  //     `,
  //     variables: rec,
  //   }
  // })

  const result = sponsors.concat(
    venues,
    associations,
    competitions,
    seasons,
    phases,
    groups,
    awards,
    teams
  )

  return result
}
