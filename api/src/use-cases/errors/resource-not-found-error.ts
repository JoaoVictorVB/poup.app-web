export class ResourceNotFoundError extends Error {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`)
    this.name = 'ResourceNotFoundError'
  }
}
