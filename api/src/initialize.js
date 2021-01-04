export const initializeDatabase = driver => {
  const initCypher = `CALL apoc.schema.assert({}, {
    Player: ["playerId"],
    MetaPlayer: ["metaPlayerId"],
    Staff: ["staffId"],
    Account: ["accountId"],
    Team: ["teamId"],
    Lineup: ["lineupId"],
    Game: ["gameId"],
    GameEvent: ["gameEventId"],
    Save: ["saveId"],
    Star: ["starId"],
    Pass: ["passId"],
    Offside: ["offsideId"],
    Goal: ["goalId"],
    Shot: ["shotId"],
    PenaltyShot: ["penaltyShot"],
    Revision: ["revisionId"],
    Timeout: ["timeoutId"],
    Penalty: ["penaltyId"],
    IntervalOnIce: ["intervalOnIceId"],
    Fight: ["fightId"],
    FaceOff: ["faceOffId"],
    Icing: ["icingId"],
    TakeOver: ["takeOverId"],
    Hit: ["hitId"],
    Injury: ["injuryId"],
    Suspension: ["suspensionId"],
    AvailabilityStatus: ["availabilityStatusId"],
    Transfer: ["transferId"],
    Discussion: ["discussionId"],
    Comment: ["commentId"],
    Association: ["associationId"],
    Sponsor: ["sponsorId"],
    Venue: ["venueId"],
    Address: ["addressId"],
    Competition: ["competitionId"],
    Event: ["eventId"],
    Season: ["seasonId"],
    Group: ["groupId"],
    Phase: ["phaseId"],
    Payment: ["paymentId"],
    Award: ["awardId"],
    Media: ["mediaId"],
    File: ["fileId"],
    Invitation: ["invitationId"],
    InvitationList: ["invitationListId"],
    Achievement: ["achievementId"],
    Rules: ["rulesId"],
    PenaltyShotStatus: ["penaltyShotStatusId"],
    Period: ["periodId"],
    ShotSubType: ["shotSubTypeId"],
    ShotTarget: ["shotTargetId"],
    ShotStyle: ["shotStyleId"],
    ShotType: ["shotTypeId"],
    GoalType: ["goalTypeId"],
    GoalSubType: ["goalSubTypeId"],
    PenaltySubType: ["penaltySubTypeId"],
    PenaltyType: ["PenaltyTypeId"],
    GameEventLocation: ["gameEventLocationId"],
    PositionType: ["positionTypeId"],
    Wear: ["wearId"],
    WearItem: ["wearItemId"],
    Position: ["positionId"],
    JerseyNo: ["jerseyNoId"],
    FinalResult: ["finalResultId"],
    InjuryType: ["injuryTypeId"],
    ResultType: ["resultTypeId"],
    ResultPoint: ["resultPointId"]
  })`

  const executeQuery = driver => {
    const session = driver.session()
    return session
      .writeTransaction(tx => tx.run(initCypher))
      .then()
      .finally(() => session.close())
  }

  executeQuery(driver).catch(error => {
    console.error('Database initialization failed to complete\n', error.message)
  })
}
