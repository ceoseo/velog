import Image from 'next/image'
import styles from './RatioImage.module.css'
import { bindClassNames } from '@/lib/styles/bindClassNames'

const cx = bindClassNames(styles)

type Props = {
  widthRatio: number
  heightRatio: number
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
}

function RatioImage({
  widthRatio,
  heightRatio,
  src,
  alt,
  className = '',
  width,
  height,
  fill,
}: Props) {
  const paddingTop = `${(heightRatio / widthRatio) * 100}%`
  return (
    <div className={cx('block', className)} style={{ paddingTop }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={true}
        fill={fill}
        blurDataURL={src}
      />
    </div>
  )
}

export default RatioImage
