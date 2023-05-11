export class UniversityNotFoundError extends Error {
  constructor() {
    super('University not found')
    this.name = 'UniversityNotFoundError'
  }
}
