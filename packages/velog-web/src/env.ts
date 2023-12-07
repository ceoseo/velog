import { z } from 'zod'

type DockerEnv = 'development' | 'stage' | 'production'
type AppEnvironment = 'development' | 'production'

const dockerEnv = (process.env.DOCKER_ENV as DockerEnv) || 'development'
const appEnv: AppEnvironment = ['stage', 'production'].includes(dockerEnv)
  ? 'production'
  : 'development'

const env = z.object({
  dockerEnv: z.enum(['development', 'production', 'stage']),
  appEnv: z.enum(['development', 'production']),
  publicUrl: z.string(),
  clientHost: z.string(),
  clientV2Host: z.string(),
  apiV2Host: z.string(),
  apiV3Host: z.string(),
  graphqlHost: z.string(),
  graphqlHostNoCDN: z.string(),
  defaultPostLimit: z.number().default(20),
  gaMeasurementId: z.string(),
})

export const ENV = env.parse({
  dockerEnv,
  // allowed standard env names,  https://nextjs.org/docs/messages/non-standard-node-env
  appEnv,
  publicUrl: process.env.NEXT_PUBLIC_PUBLIC_URL,
  clientHost: process.env.NEXT_PUBLIC_CLIENT_HOST,
  clientV2Host: process.env.NEXT_PUBLIC_CLIENT_V2_HOST,
  apiV2Host: process.env.NEXT_PUBLIC_API_V2_HOST,
  apiV3Host: process.env.NEXT_PUBLIC_API_V3_HOST,
  graphqlHost: process.env.NEXT_PUBLIC_GRAPHQL_HOST,
  graphqlHostNoCDN: process.env.NEXT_PUBLIC_GRAPHQL_HOST_NOCDN,
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
})
