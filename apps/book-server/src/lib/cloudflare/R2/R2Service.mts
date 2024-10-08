import { injectable, singleton } from 'tsyringe'
import { R2Service as R2 } from '@packages/library/r2'
import { ENV } from '@env'

interface Service {}

@injectable()
@singleton()
export class R2Service extends R2 implements Service {
  constructor() {
    super({
      accountId: ENV.cloudflareR2AccountId,
      region: 'APAC',
      accessKeyId: ENV.cloudflareR2AccessKeyId,
      secretAccessKey: ENV.cloudflareR2SecretAccessKey,
      bucketName: 'velog',
    })
  }
}
