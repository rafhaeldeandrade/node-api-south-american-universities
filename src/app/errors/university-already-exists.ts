export class UniversityAlreadyExistsError extends Error {
  constructor() {
    super('University already exists')
    this.name = 'UniversityAlreadyExistsError'
  }
}
