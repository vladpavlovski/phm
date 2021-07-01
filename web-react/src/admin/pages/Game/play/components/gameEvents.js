export const eventTypes = [
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
  {
    type: 'faceOff',
    name: 'Face Off',
    color: '#688B58',
    steps: [
      {
        name: 'Remaining time',
        optional: false,
        field: 'remainingTime',
      },
      {
        name: 'Won By',
        optional: false,
        field: 'wonBy',
      },
      {
        name: 'Lost By',
        optional: false,
        field: 'lostBy',
      },
    ],
  },
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
  //   type: 'penalty',
  //   name: 'Penalty',
  //   color: '#FE5F55',
  //   steps: [],
  // },
  // {
  //   type: 'timeout',
  //   name: 'Timeout',
  //   color: '#A26769',
  //   steps: [],
  // },
  // {
  //   type: 'save',
  //   name: 'Save',
  //   color: '#291528',
  //   steps: [],
  // },
  // {
  //   type: 'penaltyShot',
  //   name: 'Penalty Shot',
  //   color: '#DB995A',
  //   steps: [],
  // },
  // {
  //   type: 'shot',
  //   name: 'Shot',
  //   color: '#068D9D',
  //   steps: [],
  // },
  {
    type: 'goal',
    name: 'Goal',
    color: '#363537',
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
