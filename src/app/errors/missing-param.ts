export class MissingParamError extends Error {
  constructor(paramName: string) {
    super(`${paramName} param is missing`)
    this.name = 'MissingParamError'
  }
}
