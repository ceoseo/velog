import styles from './HeaderLogo.module.css'
import { Logo as VelogLogo } from '@/assets/icons/components'
import Link from 'next/link'
import { bindClassNames } from '@/lib/styles/bindClassNames'

const cx = bindClassNames(styles)

function HeaderLogo() {
  return (
    <div className={cx('block')}>
      <Link href="/">
        <VelogLogo className={cx('velogLogo')} data-testid="velog-logo" width={71} height={24} />
      </Link>
    </div>
  )
}

export default HeaderLogo
