import type { FastifyRequest, FastifyReply } from 'fastify'

export type GraphQLContext = {
  request: FastifyRequest
  reply: FastifyReply
  user: { id: string } | null
  ip: string | null
}
