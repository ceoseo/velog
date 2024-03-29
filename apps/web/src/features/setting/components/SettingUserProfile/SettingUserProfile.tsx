'use client'

import useToggle from '@/hooks/useToggle'
import styles from './SettingUserProfile.module.css'
import { bindClassNames } from '@/lib/styles/bindClassNames'
import useInputs from '@/hooks/useInputs'
import Button from '@/components/Button'
import SettingInput from '../SettingInput'
import SettingEditButton from '../SettingEditButton'
import Thumbnail from '@/components/Thumbnail'
import useUpload from '@/hooks/useUpload'
import { useContext, useEffect, useState } from 'react'
import { useCFUpload } from '@/hooks/useCFUpload'
import {
  useCurrentUserQuery,
  useUpdateProfileMutation,
  useUpdateThumbnailMutation,
} from '@/graphql/helpers/generated'
import JazzbarContext from '@/providers/JazzbarProvider'

const cx = bindClassNames(styles)

type Props = {
  thumbnail: string | null
  displayName: string
  shortBio: string
}

function SettingUserProfile({ displayName, shortBio, thumbnail }: Props) {
  const [upload] = useUpload()
  const { mutateAsync: updateThumbnailMutateAsync } = useUpdateThumbnailMutation()
  const { mutateAsync: updateProfileMutateAsync } = useUpdateProfileMutation()
  const { data, refetch: currentUserRefetch, isRefetching } = useCurrentUserQuery()
  const { upload: cfUpload } = useCFUpload()
  const [edit, onToggleEdit] = useToggle(false)

  const {
    inputs,
    onChange: onInputChange,
    dispatch,
  } = useInputs({
    thumbnail,
    displayName,
    shortBio,
  })

  const { setValue, fakeProgress } = useContext(JazzbarContext)

  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!data?.currentUser) return
    const profile = data?.currentUser.profile
    if (!profile) return
    dispatch({
      name: 'thumbnail',
      value: profile.thumbnail ?? '',
    })
    dispatch({
      name: 'displayName',
      value: profile.display_name,
    })
    dispatch({
      name: 'shortBio',
      value: profile.short_bio,
    })
  }, [data, isRefetching, dispatch])

  const uploadThumbnail = async () => {
    const file = await upload()
    if (!file) return
    setValue(30)
    const objectURL = URL.createObjectURL(file)
    setImageBlobUrl(objectURL)
    setIsLoading(true)
    const timerId = fakeProgress()

    try {
      const image = await cfUpload({ file, info: { type: 'profile' } })
      setIsLoading(false)
      if (!image) return
      await updateThumbnailMutateAsync({
        input: {
          url: image,
        },
      })
      currentUserRefetch()
    } finally {
      setValue(100)
      URL.revokeObjectURL(objectURL)
      clearInterval(timerId!)
    }
  }

  const clearThumbnail = async () => {
    await updateThumbnailMutateAsync({
      input: {
        url: null,
      },
    })
    setImageBlobUrl(null)
    currentUserRefetch()
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProfileMutateAsync({
      input: { display_name: inputs.displayName, short_bio: inputs.shortBio.trim() },
    })
    onToggleEdit()
    currentUserRefetch()
  }

  return (
    <section className={cx('block')}>
      <div className={cx('thumbnailArea')}>
        <Thumbnail
          src={imageBlobUrl || inputs.thumbnail}
          alt="profile"
          className={cx('thumbnail')}
          priority={true}
        />
        <Button onClick={uploadThumbnail} disabled={isLoading}>
          {isLoading ? '업로드중...' : '이미지 업로드'}
        </Button>
        <Button color="transparent" onClick={clearThumbnail}>
          이미지 제거
        </Button>
      </div>
      <div className={cx('infoArea')}>
        {edit ? (
          <form className={cx('form')} onSubmit={onSubmit}>
            <SettingInput
              placeholder="이름"
              fullWidth
              className={cx('displayName')}
              name="displayName"
              value={inputs.displayName}
              onChange={onInputChange}
            />
            <SettingInput
              placeholder="한 줄 소개"
              fullWidth
              name="shortBio"
              value={inputs.shortBio}
              onChange={onInputChange}
              autoFocus
            />
            <div className={cx('buttonWrapper')}>
              <Button>저장</Button>
            </div>
          </form>
        ) : (
          <>
            <h2>{inputs.displayName}</h2>
            <p>{inputs.shortBio}</p>
            <SettingEditButton onClick={onToggleEdit} />
          </>
        )}
      </div>
    </section>
  )
}

export default SettingUserProfile
