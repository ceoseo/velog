import { GetUserFollowInfoDocument, User } from '@/graphql/server/generated/server'
import graphqlFetch, { GraphqlRequestBody } from '@/lib/graphqlFetch'

export default async function getUserFollowInfo(username: string) {
  if (!username) return null
  try {
    const body: GraphqlRequestBody = {
      operationName: 'getUserFollowInfo',
      query: GetUserFollowInfoDocument,
      variables: {
        input: {
          username,
        },
      },
    }

    const { user } = await graphqlFetch<{ user: User }>({
      method: 'GET',
      body,
      next: { revalidate: 0 },
    })

    if (!user) {
      return null
    }

    return { ...user, profile: user.profile! }
  } catch (error) {
    console.log('getUserFollowInfo error', error)
    return null
  }
}
