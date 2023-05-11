import { University } from '@/domain/entities/university'

export interface UniversityRepository {
  findByProperties(props: Partial<University>): Promise<University | null>
  save(university: University): Promise<University>
}
