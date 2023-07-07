import { TrendingPostsInput } from '@/graphql/generated'
import { sdk } from '@/lib/sdk'
import { Posts } from '@/types/post'
import { useCallback, useEffect, useState } from 'react'

export default function useTrendingPosts(defaultPosts: Posts[] = []) {
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState<Posts[]>(defaultPosts)
  const [hasPetched, setHasPetched] = useState(false)

  const fetching = useCallback(
    async ({ limit, offset, timeframe }: TrendingPostsInput) => {
      if (!hasPetched) return posts
      setLoading(true)
      const { trendingPosts } = await sdk.trendingPosts({
        input: { limit, offset, timeframe },
      })

      if (Array.isArray(trendingPosts) && trendingPosts.length > 0) {
        setPosts((prev) => [...prev, ...(trendingPosts as Posts[])])
      }
      setLoading(false)
    },
    [posts, hasPetched]
  )

  useEffect(() => {
    setHasPetched(true)
  }, [])

  return { loading, posts, fetching }
}
