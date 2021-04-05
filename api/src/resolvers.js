export const resolvers = {
  Player: {
    name: obj => {
      return `${obj.firstName} ${obj.lastName}`
    },
  },
  Person: {
    name: obj => {
      return `${obj.firstName} ${obj.lastName}`
    },
  },
}
