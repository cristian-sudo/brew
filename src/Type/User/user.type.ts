export type UserType = {
  email: string,
  firstName: string,
  lastName: string,
  status: {
    name: string,
    id: number
  },
  roles: Array<string>,
  id: number
};
