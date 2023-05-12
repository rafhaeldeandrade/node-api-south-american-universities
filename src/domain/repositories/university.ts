import { University } from '@/domain/entities/university'

export interface UniversityRepository {
  findById(id: string): Promise<University | null>
  findByProperties(props: Partial<University>): Promise<University | null>
  save(university: University): Promise<University>
  deleteById(id: string): Promise<void>
  countDocuments(props: Partial<University>): Promise<number>
  findAll(
    props: Partial<University>,
    options?: { skip: number; limit: number }
  ): Promise<University[]>
  findByIdAndUpdate(
    id: string,
    dataToUpdate: Partial<University>
  ): Promise<void>
}
