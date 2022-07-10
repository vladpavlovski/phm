export type TEventType = {
  type: string
  name: string
  color: string
}

export const eventTypes: TEventType[] = [
  {
    type: 'goal',
    name: 'Goal',
    color: '#83FF33',
  },
  {
    type: 'penalty',
    name: 'Penalty',
    color: '#FF3633',
  },
  {
    type: 'penaltyShot',
    name: 'Penalty Shot',
    color: '#FF5B33',
  },
  {
    type: 'injury',
    name: 'Injury',
    color: '#FF3333',
  },

  {
    type: 'save',
    name: 'Save',
    color: '#CF9F15',
  },
  {
    type: 'faceOff',
    name: 'Face Off',
    color: '#FAEEAA',
  },
  // {
  //   type: 'hit',
  //   name: 'Hit',
  //   color: '#0077B6',
  // },
  // {
  //   type: 'takeOver',
  //   name: 'Take Over',
  //   color: '#EFD5C3',
  // },
  // {
  //   type: 'icing',
  //   name: 'Icing',
  //   color: '#EF3054',
  // },

  // {
  //   type: 'fight',
  //   name: 'Fight',
  //   color: '#D64933',

  // },
  // {
  //   type: 'intervalOnIce',
  //   name: 'Interval On Ice',
  //   color: '#9649CB',
  // },

  // {
  //   type: 'timeout',
  //   name: 'Timeout',
  //   color: '#A26769',
  // },

  // {
  //   type: 'shot',
  //   name: 'Shot',
  //   color: '#068D9D',
  // },

  // {
  //   type: 'revision',
  //   name: 'Revision',
  //   color: '#A1CDF4',
  // },
  // {
  //   type: 'offside',
  //   name: 'Offside',
  //   color: '#D7FCD4',
  // },
  // {
  //   type: 'pass',
  //   name: 'Pass',
  //   color: '#E5F4E3',
  // },
  // {
  //   type: 'star',
  //   name: 'Star',
  //   color: '#FFD400',
  // },
]

export const getEventSettings = (type: string): TEventType | null => {
  return eventTypes.find(et => et.type === type) || null
}
