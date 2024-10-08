import { HttpError } from './HttpError.mjs'

export class InternalServerError extends HttpError {
  constructor(message = 'INTERNAL_SERVER_ERROR') {
    super('internal server error', message, 500)
  }
}
