import { University } from '@/domain/entities/university'
import { UniversityRepository } from '@/domain/repositories/university'
import { UniversityModel } from '@/infra/mongodb/schemas/university'

export class MongoDBUniversityRepository implements UniversityRepository {
  async save(university: University): Promise<University> {
    const newAccount = new UniversityModel(university)
    await newAccount.save()

    return university
  }

  async findByProperties(
    properties: Partial<University>
  ): Promise<University | null> {
    const university = await UniversityModel.findOne(
      { ...properties },
      {},
      { lean: true }
    )
    if (!university) return null

    return this.mapModelToDomain(university)
  }

  mapModelToDomain(model: any): University {
    return {
      id: model.id,
      stateProvince: model.stateProvince ? model.stateProvince : null,
      alphaTwoCode: model.alphaTwoCode,
      webPages: model.webPages,
      country: model.country,
      name: model.name,
      domains: model.domains,
    }
  }
}
