import { usePathname, redirect } from 'next/navigation'
import styles from './VelogTab.module.css'
import { bindClassNames } from '@/lib/styles/bindClassNames'
import ActiveLink from '@/components/ActiveLink'
import { motion } from 'framer-motion'

const cx = bindClassNames(styles)

type Props = {
  username: string
}

const tabIndexMap: Record<Tab, number> = {
  posts: 0,
  series: 1,
  about: 2,
}

const tabs = ['posts', 'series', 'about']

function VelogTab({ username }: Props) {
  const pathname = usePathname()
  const url = `/@${username}`
  const tab = pathname.split('/').reverse()[0] as Tab

  if (!tabs.includes(tab)) {
    redirect(`${url}/posts`)
  }

  const tabIndex = tabIndexMap[tab]

  const withPrefix = (path: Tab) => `${url}/${path}`
  return (
    <div className={cx('block')}>
      <div className={cx('wrapper')}>
        <ActiveLink
          href={withPrefix('posts')}
          className={cx('item', { active: pathname.includes('/posts') })}
        >
          글
        </ActiveLink>
        <ActiveLink
          href={withPrefix('series')}
          className={cx('item', { active: pathname.includes('/series') })}
        >
          시리즈
        </ActiveLink>
        <ActiveLink
          href={withPrefix('about')}
          className={cx('item', { active: pathname.includes('/about') })}
        >
          소개
        </ActiveLink>
        <motion.div
          initial={false}
          animate={{
            left: `${tabIndex * 33.3333}%`,
          }}
          className={cx('indicator')}
        />
      </div>
    </div>
  )
}

export default VelogTab

type Tab = 'posts' | 'series' | 'about'
