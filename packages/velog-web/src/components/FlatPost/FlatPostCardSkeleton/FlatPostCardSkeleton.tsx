import styles from './FlatPostCardSkeleton.module.css'
import { bindClassNames } from '@/lib/styles/bindClassNames'

const cx = bindClassNames(styles)

type Props = {}

function FlatPostCardSkeleton({}: Props) {
  return <div className={cx('block')}></div>
}

export default FlatPostCardSkeleton
