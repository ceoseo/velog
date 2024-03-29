import { CurrentUserDocument, User } from '@/graphql/helpers/generated'
import { getAccessToken } from '@/lib/auth'
import graphqlFetch, { GraphqlRequestBody } from '@/lib/graphqlFetch'

export default async function getCurrentUser() {
  try {
    const headers = {}
    const token = getAccessToken()

    if (token) {
      Object.assign(headers, { authorization: `Bearer ${token.value}` })
    }

    const body: GraphqlRequestBody = {
      operationName: 'currentUser',
      query: CurrentUserDocument,
      variables: {},
    }

    const { currentUser } = await graphqlFetch<{ currentUser: User }>({
      method: 'GET',
      body,
      next: { revalidate: 0 },
      headers,
    })

    return currentUser
  } catch (error) {
    console.log('get Current user error', error)
    return null
  }
}
