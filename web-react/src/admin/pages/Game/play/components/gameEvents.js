export const eventTypes = [
  {
    type: 'goal',
    name: 'Goal',
    color: '#83FF33',
    steps: [
      {
        name: 'Remaining time',
        optional: false,
        field: 'remainingTime',
      },
      {
        name: 'Scored by',
        optional: false,
        field: 'scoredBy',
      },
      {
        name: 'First assist',
        optional: true,
        field: 'firstAssist',
      },
      {
        name: 'Second assist',
        optional: true,
        field: 'secondAssist',
      },
      {
        name: 'Goal type',
        optional: true,
        field: 'goalType',
      },
      {
        name: 'Shot type',
        optional: true,
        field: 'shotType',
      },
    ],
  },
  {
    type: 'penalty',
    name: 'Penalty',
    color: '#FF3633',
    steps: [
      {
        name: 'Remaining time',
        optional: false,
        field: 'remainingTime',
      },
      {
        name: 'Penalized',
        optional: false,
        field: 'penalized',
      },
      {
        name: 'Penalty type',
        optional: false,
        field: 'penaltyType',
      },
    ],
  },
  {
    type: 'penaltyShot',
    name: 'Penalty Shot',
    color: '#FF5B33',
    steps: [
      {
        name: 'Remaining time',
        optional: false,
        field: 'remainingTime',
      },
      {
        name: 'Executed by',
        optional: true,
        field: 'executedBy',
      },
      {
        name: 'Faced against',
        optional: true,
        field: 'facedAgainst',
      },
    ],
  },
  {
    type: 'injury',
    name: 'Injury',
    color: '#FF3333',
    steps: [
      {
        name: 'Remaining time',
        optional: false,
        field: 'remainingTime',
      },
      {
        name: 'Suffered',
        optional: false,
        field: 'suffered',
      },
      {
        name: 'Injury type',
        optional: true,
        field: 'injuryType',
      },
    ],
  },

  {
    type: 'save',
    name: 'Save',
    color: '#CF9F15',
    steps: [
      {
        name: 'Remaining time',
        optional: false,
        field: 'remainingTime',
      },
      {
        name: 'Saved by',
        optional: true,
        field: 'savedBy',
      },
    ],
  },
  {
    type: 'faceOff',
    name: 'Face Off',
    color: '#FAEEAA',
    steps: [
      {
        name: 'Remaining time',
        optional: false,
        field: 'remainingTime',
      },
      {
        name: 'Won by',
        optional: true,
        field: 'wonBy',
      },
      {
        name: 'Lost by',
        optional: true,
        field: 'lostBy',
      },
    ],
  },
  // {
  //   type: 'hit',
  //   name: 'Hit',
  //   color: '#0077B6',
  //   steps: [
  //     { name: '', optional: false },
  //   ],
  // },
  // {
  //   type: 'takeOver',
  //   name: 'Take Over',
  //   color: '#EFD5C3',
  //   steps: [],
  // },
  // {
  //   type: 'icing',
  //   name: 'Icing',
  //   color: '#EF3054',
  //   steps: [],
  // },

  // {
  //   type: 'fight',
  //   name: 'Fight',
  //   color: '#D64933',
  //   steps: [],
  // },
  // {
  //   type: 'intervalOnIce',
  //   name: 'Interval On Ice',
  //   color: '#9649CB',
  //   steps: [],
  // },

  // {
  //   type: 'timeout',
  //   name: 'Timeout',
  //   color: '#A26769',
  //   steps: [],
  // },

  // {
  //   type: 'shot',
  //   name: 'Shot',
  //   color: '#068D9D',
  //   steps: [],
  // },

  // {
  //   type: 'revision',
  //   name: 'Revision',
  //   color: '#A1CDF4',
  //   steps: [],
  // },
  // {
  //   type: 'offside',
  //   name: 'Offside',
  //   color: '#D7FCD4',
  //   steps: [],
  // },
  // {
  //   type: 'pass',
  //   name: 'Pass',
  //   color: '#E5F4E3',
  //   steps: [],
  // },
  // {
  //   type: 'star',
  //   name: 'Star',
  //   color: '#FFD400',
  //   steps: [],
  // },
]

export const getEventData = type => {
  return eventTypes.find(et => et.type === type)
}
