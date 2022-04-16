type EnumListItem = {
  name: string
  value: string
}

type EnumListItems = Array<EnumListItem>

export const timeUnitStatusList: EnumListItems = [
  {
    name: 'Not Started',
    value: 'NOTSTARTED',
  },
  {
    name: 'Running',
    value: 'RUNNING',
  },
  {
    name: 'Finished',
    value: 'FINISHED',
  },
  {
    name: 'Postponed',
    value: 'POSTPONED',
  },
  {
    name: 'Cancelled',
    value: 'CANCELLED',
  },
]

export const activityStatusList: EnumListItems = [
  {
    name: 'Active',
    value: 'ACTIVE',
  },
  {
    name: 'Inactive',
    value: 'INACTIVE',
  },
  {
    name: 'Retired',
    value: 'RETIRED',
  },
  {
    name: 'Unknown',
    value: 'UNKNOWN',
  },
]
