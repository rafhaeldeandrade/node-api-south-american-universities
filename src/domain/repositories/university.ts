import { University } from '@/domain/entities/university'

export interface UniversityRepository {
  findById(id: string): Promise<University | null>
  findByProperties(props: Partial<University>): Promise<University | null>
  save(university: University): Promise<University>
  deleteById(id: string): Promise<void>
}
