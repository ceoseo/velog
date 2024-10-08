import Fastify from 'fastify'
import formbody from '@fastify/formbody'
import cookie from '@fastify/cookie'
import { ENV } from '@env'
import routes from '@routes/index.mjs'
import multer from 'fastify-multer'
import validatorCompilerPlugin from '@plugins/global/validatorCompilerPlugin.mjs'
import authPlugin from '@plugins/global/authPlugin.mjs'
import corsPlugin from '@plugins/global/corsPlugin.mjs'
import errorHandlerPlugin from '@plugins/global/errorHandlerPlugin.mjs'
import ipaddrPlugin from '@plugins/global/ipaddrPlugin.mjs'
import keepAlivePlugin from '@plugins/global/keepAlivePlugin.mjs'
import mercuriusPlugin from '@plugins/global/mercuriusPlugin.mjs'

const app = Fastify({
  logger: true,
  trustProxy: true,
})

app.register(cookie, { secret: ENV.cookieSecretKey })
app.register(formbody)

await app.register(corsPlugin)
app.register(authPlugin)
app.register(ipaddrPlugin)
app.register(mercuriusPlugin)
app.register(multer.contentParser)
app.register(validatorCompilerPlugin)
app.register(errorHandlerPlugin)
app.register(keepAlivePlugin)

app.register(routes)

export default app
