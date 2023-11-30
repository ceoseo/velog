import { GetPostsInput, Post, PostsDocument } from '@/graphql/generated'
import graphqlFetch, { GraphqlRequestBody } from '@/lib/graphqlFetch'

export default async function getVelogPosts({ username, tag }: GetPostsInput) {
  try {
    const body: GraphqlRequestBody = {
      operationName: 'posts',
      query: PostsDocument,
      variables: {
        input: {
          username,
          tag,
          limit: 20,
        },
      },
    }

    const { posts } = await graphqlFetch<{ posts: Post[] }>({
      body,
      next: { revalidate: 100 },
    })

    return posts
  } catch (error) {
    console.log('getVelogPosts error', error)
    return []
  }
}