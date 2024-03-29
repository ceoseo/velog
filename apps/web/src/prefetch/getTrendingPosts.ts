'use server'

import { ENV } from '@/env'
import { Post, TrendingPostsDocument, TrendingPostsInput } from '@/graphql/helpers/generated'
import graphqlFetch, { GraphqlRequestBody } from '@/lib/graphqlFetch'

export default async function getTrendingPosts({
  limit = ENV.defaultPostLimit,
  timeframe = 'week',
  offset = 0,
}: TrendingPostsInput) {
  try {
    const body: GraphqlRequestBody = {
      operationName: 'trendingPosts',
      query: TrendingPostsDocument,
      variables: {
        input: {
          limit,
          offset,
          timeframe,
        },
      },
    }

    const { trendingPosts } = await graphqlFetch<{ trendingPosts: Post[] }>({
      method: 'GET',
      body,
      next: { revalidate: 10 },
    })

    return trendingPosts
  } catch (error) {
    console.log('getTrendingPosts error', error)
    return []
  }
}
