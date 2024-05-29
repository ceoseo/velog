import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import { WriterService } from '@services/WriterService/index.mjs'
import { container } from 'tsyringe'
import { CookieService } from '@lib/cookie/CookieService.mjs'
import { JwtService } from '@lib/jwt/JwtService.mjs'
import type { AccessTokenData } from '@packages/library/jwt'

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('writer', null)
  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url.includes('/auth/logout')) return

    const cookie = container.resolve(CookieService)
    try {
      const writerService = container.resolve(WriterService)
      const jwtService = container.resolve(JwtService)

      let accessToken: string | undefined = request.cookies['access_token']

      const authorization = request.headers['authorization']

      if (!accessToken && !!authorization && typeof authorization === 'string') {
        accessToken = authorization.split('Bearer ')[1]
      }

      if (!accessToken) return
      const accessTokenData = await jwtService.decodeToken<AccessTokenData>(accessToken)
      const { exists, writerId } = await writerService.checkExistsWriter(accessTokenData.user_id)

      if (!exists) {
        // TODO: automatic register to writer
        throw new Error('Writer not found')
      }

      request.writer = { id: writerId }
    } catch (error) {
      console.log('auth Plugin error', error)
      cookie.clearCookie(reply, 'access_token')
      cookie.clearCookie(reply, 'refresh_token')
    }
  })
}

export default fp(authPlugin)
