'use client'

import {
  FollowResult,
  GetFollowingsDocument,
  GetFollowingsQuery,
  GetFollowingsQueryVariables,
} from '@/graphql/helpers/generated'
import { infiniteGetFollowingsQueryKey } from '@/graphql/helpers/queryKey'
import useCustomInfiniteQuery from '@/hooks/useCustomInfiniteQuery'
import { useMemo } from 'react'

export default function useFollowings(username: string, limit = 20) {
  const fetchInput = useMemo(() => {
    return {
      username,
      limit,
    }
  }, [username, limit])

  const { data, isLoading, isFetching, fetchMore } = useCustomInfiniteQuery<
    GetFollowingsQuery,
    GetFollowingsQueryVariables
  >({
    queryKey: infiniteGetFollowingsQueryKey({ input: fetchInput }),
    document: GetFollowingsDocument,
    initialPageParam: {
      input: fetchInput,
    },
    getNextPageParam: (page) => {
      const { followings } = page
      if (!followings) return undefined
      if (followings.length < limit) return undefined
      return {
        username,
        limit,
        cursor: followings[followings.length - 1]?.id,
      }
    },
    retryDelay: 1000,
    gcTime: 1000,
    networkMode: 'always',
  })

  const followings = useMemo(() => {
    return [...(data?.pages?.flatMap((page) => page.followings) || [])] as FollowResult[]
  }, [data])

  return {
    followings,
    isFetching,
    originData: data,
    isLoading,
    fetchMore,
  }
}
