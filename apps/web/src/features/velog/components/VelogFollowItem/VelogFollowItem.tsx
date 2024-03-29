'use client'

import Thumbnail from '@/components/Thumbnail'
import styles from './VelogFollowItem.module.css'
import { bindClassNames } from '@/lib/styles/bindClassNames'
import FollowButton from '@/components/FollowButton'
import Link from 'next/link'
import { Noto_Sans_KR } from 'next/font/google'
import { useQueryClient } from '@tanstack/react-query'
import { useGetUserFollowInfoQuery } from '@/graphql/helpers/generated'
import { useParams } from 'next/navigation'
import { getUsernameFromParams } from '@/lib/utils'

const cx = bindClassNames(styles)

type Props = {
  userId: string
  thumbnail: string
  isFollowed: boolean
  description: string
  username: string
  displayName: string
}

const notoSansKr = Noto_Sans_KR({
  weight: ['300', '400'],
  subsets: ['latin'],
  display: 'swap',
})

function VelogFollowItem({ userId, thumbnail, username, description, displayName }: Props) {
  const params = useParams()
  const queryClient = useQueryClient()
  const velogUrl = `/@${username}/posts`

  const onSuccess = () => {
    const targetUsername = getUsernameFromParams(params)
    queryClient.refetchQueries({
      queryKey: useGetUserFollowInfoQuery.getKey({ input: { username: targetUsername } }),
    })
  }

  return (
    <li className={cx('block')}>
      <Link href={velogUrl}>
        <Thumbnail className={cx('thumbnail')} src={thumbnail} />
      </Link>
      <div className={cx('content')}>
        <Link href={velogUrl} className={cx('info')}>
          <span className={cx('text')}>{displayName}</span>
          <span className={cx('username')}>{`@${username}`}</span>
        </Link>
        <div className={cx('description', notoSansKr.className)}>{description}</div>
      </div>
      <div className={cx('button')}>
        <FollowButton followingUserId={userId} onSuccess={onSuccess} />
      </div>
    </li>
  )
}

export default VelogFollowItem
