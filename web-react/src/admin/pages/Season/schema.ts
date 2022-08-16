import { date, object, string } from 'yup'

export const schema = object().shape({
  name: string().required('Name is required'),
  nick: string(),
  short: string(),
  startDate: date().nullable().required('Start date is required'),
  endDate: date().nullable().required('End date is required'),
  status: string().required('Status is required'),
})
