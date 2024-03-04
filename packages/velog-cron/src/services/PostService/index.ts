import { DbService } from '@lib/db/DbService.js'
import { Post, Prisma } from '@prisma/velog-rds/client'
import { injectable, singleton } from 'tsyringe'

interface Service {
  findById(postId: string): Promise<Post | null>
  scoreCalculator(postId: string): Promise<void>
}

@singleton()
@injectable()
export class PostService implements Service {
  constructor(private readonly db: DbService) {}
  public async findById(postId: string): Promise<Post | null> {
    const post = await this.db.post.findUnique({
      where: {
        id: postId,
      },
    })
    return post
  }
  public async findByUserId({ userId, ...queries }: FindByUserIdParams): Promise<Post[]> {
    const { where, ...query } = queries
    const posts = await this.db.post.findMany({
      where: {
        ...where,
        fk_user_id: userId,
      },
      ...query,
    })
    return posts
  }
  public async scoreCalculator(postId: string): Promise<void> {
    const post = await this.findById(postId)

    if (!post) {
      throw new Error('Not found Post')
    }

    const postLikes = await this.db.postLike.count({
      where: {
        fk_post_id: postId,
      },
    })

    const ONE_HOUR = 1000 * 60 * 60
    const itemHourAge = (Date.now() - post.released_at!.getTime()) / ONE_HOUR
    const gravity = 0.35
    const votes = postLikes + (post.views ?? 0) * 0.04

    const score = votes / Math.pow(itemHourAge + 2, gravity)

    await this.db.post.update({
      where: {
        id: post.id,
      },
      data: {
        score,
      },
    })
  }
}

type FindByUserIdParams = {
  userId: string
} & Prisma.PostFindManyArgs
