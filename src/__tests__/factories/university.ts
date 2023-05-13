import { faker } from '@faker-js/faker'

import { University } from '@/domain/entities/university'

export function makeUniversity(props?: Partial<University>): University {
  const university = {
    id: faker.datatype.uuid(),
    name: faker.lorem.words(),
    domains: [faker.internet.domainName()],
    country: faker.address.country(),
    stateProvince: faker.address.stateAbbr(),
    alphaTwoCode: faker.address.countryCode(),
    webPages: [faker.internet.url()],
  }
  return {
    ...university,
    ...props,
  }
}
