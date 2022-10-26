export type DealType = {
  name: string,
  description: string,
  dealCondition: string,
  price: number,
  status: { name: string, id: number },
  user: {
    email: string,
    firstName: string,
    lastName: string,
    status: [Object],
    roles: [Array<any>],
    id: number,
  },
  id: number,
  buyer: {
    email: string,
    firstName: string,
    lastName: string,
    status: [Object],
    roles: [Array<string>],
    id: number,
  }
};
