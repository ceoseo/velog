import { VelogConfig, VelogConfigDocument } from '@/graphql/server/generated/server'
import { getAccessToken } from '@/lib/auth'
import graphqlFetch, { GraphqlRequestBody } from '@/lib/graphqlFetch'

export default async function getVelogConfig({ username }: Args) {
  try {
    const headers = {}
    const token = await getAccessToken()
    if (token) {
      Object.assign(headers, { authorization: `Bearer ${token.value}` })
    }

    const body: GraphqlRequestBody = {
      operationName: 'velogConfig',
      query: VelogConfigDocument,
      variables: {
        input: {
          username,
        },
      },
    }

    const { velogConfig } = await graphqlFetch<{ velogConfig: VelogConfig }>({
      method: 'GET',
      body,
      next: { revalidate: 0 },
      headers,
    })

    if (!velogConfig) {
      return null
    }

    return velogConfig
  } catch (error) {
    console.log(`getVelogConfig username: ${username}, error: ${error}`)
    return null
  }
}

type Args = {
  username: string
}
