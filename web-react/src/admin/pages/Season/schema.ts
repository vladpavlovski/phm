import { date, object, string } from 'yup'

export const schema = object().shape({
  name: string().required('Name is required'),
  nick: string(),
  short: string(),
  startDate: date().nullable(),
  endDate: date().nullable(),
  status: string().required('Status is required'),
})
