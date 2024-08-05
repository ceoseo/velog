'use client'

import { useRef } from 'react'
import useTrendingWriters from '../../hooks/useTrendingWriter'
import styles from './TrendingWriterGrid.module.css'
import { bindClassNames } from '@/lib/styles/bindClassNames'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import TrendingWriterGridSkeleton from './TrendingWriterGridSkeleton'
import TrendingWriterCardSkeleton from '../TrendingWriterCard/TrendingWriterCardSkeleton'
import TrendingWriterCard from '../TrendingWriterCard'
import { TrendingWriter } from '@/graphql/server/generated/server'

const cx = bindClassNames(styles)

type Props = {
  initialData: TrendingWriter[]
}

function TrendingWriterGrid({ initialData }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { trendingWriters, fetchMore, isLoading, isFetching } = useTrendingWriters({
    initialData,
  })

  useInfiniteScroll(ref, fetchMore)
  if (isLoading) return <TrendingWriterGridSkeleton />

  return (
    <section>
      <ul className={cx('block', 'trendingWriterGrid')}>
        {trendingWriters.map((writer) => (
          <TrendingWriterCard
            key={writer.id}
            writerId={writer.user.id}
            displayName={writer.user.profile.display_name}
            posts={writer.posts}
            thumbnail={writer.user.profile.thumbnail}
            username={writer.user.username}
          />
        ))}
        {isFetching &&
          Array.from({ length: 6 }).map((_, i) => <TrendingWriterCardSkeleton key={i} />)}
      </ul>
      <div ref={ref} />
    </section>
  )
}

export default TrendingWriterGrid
