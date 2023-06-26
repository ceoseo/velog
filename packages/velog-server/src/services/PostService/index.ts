import { Post, Prisma } from '@prisma/client'
import { injectable, singleton } from 'tsyringe'
import { ReadingListInput, RecentPostsInput, TrendingPostsInput } from '@graphql/generated.js'
import { DbService } from '@lib/db/DbService.js'
import { BadRequestError } from '@errors/BadRequestErrors.js'
import { UnauthorizedError } from '@errors/UnauthorizedError.js'

import { GetPostsByTypeParams, PostServiceInterface } from './PostServiceInterface'
import { CacheService } from '@lib/cache/CacheService.js'
import { UtilsService } from '@lib/utils/UtilsService.js'

@injectable()
@singleton()
export class PostService implements PostServiceInterface {
  constructor(
    private readonly db: DbService,
    private readonly cache: CacheService,
    private readonly utils: UtilsService
  ) {}
  public async postsByIds(ids: string[]): Promise<Post[]> {
    const posts = await this.db.post.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    })
    return posts
  }
  public async getReadingList(
    input: ReadingListInput,
    userId: string | undefined
  ): Promise<Post[]> {
    const { cursor, limit = 20, type } = input

    if (limit > 100) {
      throw new BadRequestError('Max limit is 100')
    }

    if (!userId) {
      throw new UnauthorizedError('Not Logged In')
    }
    const postGetter = {
      LIKED: this.getPostsByLiked,
      READ: this.getPostsByRead,
    }

    const selectedGetter = postGetter[type]
    return await selectedGetter({ cursor, userId, limit })
  }
  private async getPostsByLiked(input: GetPostsByTypeParams): Promise<Post[]> {
    const { cursor, userId, limit } = input
    const cursorData = cursor
      ? await this.db.postLike.findFirst({
          where: {
            fk_user_id: userId,
            fk_post_id: cursor,
          },
        })
      : null

    const cursorQueryOption = cursorData
      ? {
          updated_at: {
            lt: cursorData?.created_at,
          },
          id: { not: cursorData?.id },
        }
      : {}

    const likes = await this.db.postLike.findMany({
      where: {
        fk_user_id: userId,
        ...cursorQueryOption,
      },
      orderBy: {
        updated_at: 'desc',
        id: 'asc',
      },
      take: limit,
      select: {
        Post: true,
      },
    })
    return likes.map((like) => like.Post!)
  }
  private async getPostsByRead(input: GetPostsByTypeParams) {
    const { cursor, userId, limit } = input
    const cursorData = cursor
      ? await this.db.postReadLog.findFirst({
          where: {
            fk_post_id: cursor,
            fk_user_id: userId,
          },
        })
      : null

    const cursorQueryOption = cursorData
      ? {
          updated_at: {
            lt: cursorData?.updated_at,
          },
          id: {
            not: cursorData?.id,
          },
        }
      : {}

    const logs = await this.db.postReadLog.findMany({
      where: {
        fk_user_id: userId,
        ...cursorQueryOption,
      },
      orderBy: {
        updated_at: 'desc',
        id: 'asc',
      },
      take: limit,
      include: {
        Post: true,
      },
    })
    return logs.map((log) => log.Post)
  }
  public async getRecentPosts(
    input: RecentPostsInput,
    userId: string | undefined
  ): Promise<Post[]> {
    const { cursor, limit = 20 } = input

    if (limit > 100) {
      throw new BadRequestError('Max limit is 100')
    }

    let whereInput: Prisma.PostWhereInput = {
      is_temp: false,
    }

    const OR: any = []
    if (!userId) {
      whereInput = { is_private: false, ...whereInput }
    } else {
      OR.push({ is_private: false })
      OR.push({ fk_user_id: userId })
    }

    if (cursor) {
      const post = await this.db.post.findUnique({
        where: {
          id: cursor,
        },
      })

      if (!post) {
        throw new BadRequestError('Invalid cursor')
      }

      whereInput = { released_at: { lt: post!.released_at! }, ...whereInput }

      OR.push({
        AND: [{ released_at: post.released_at }, { id: { lt: post.id } }],
      })
    }

    if (OR.length > 0) {
      whereInput.OR = OR
    }

    const posts = await this.db.post.findMany({
      where: whereInput,
      orderBy: {
        released_at: 'desc',
      },
      include: {
        user: true,
      },
      take: limit,
    })

    return posts
  }
  public async getTrendingPosts(input: TrendingPostsInput, ip: string | null): Promise<Post[]> {
    const { offset = 0, limit = 20, timeframe = 'month' } = input
    const timeframes: [string, number][] = [
      ['day', 1],
      ['week', 7],
      ['month', 30],
      ['year', 365],
    ]
    const selectedTimeframe = timeframes.find(([text]) => text === timeframe)

    if (!selectedTimeframe) {
      throw new BadRequestError('Invalid timeframe')
    }

    if (timeframe === 'year') {
      console.log('trendingPosts - year', { offset, limit, ip })
    }

    if (timeframe === 'year' && offset > 1000) {
      console.log('Detected GraphQL Abuse', ip)
      return []
    }

    if (limit > 100) {
      throw new BadRequestError('Limit is too high')
    }

    let ids: string[] = []
    const cacheKey = this.cache.generateKey.trending(selectedTimeframe[0], offset, limit)

    const cachedIds = this.cache.lruCache.get(cacheKey)
    if (cachedIds) {
      ids = cachedIds
    } else {
      const rows = (await this.db.$queryRaw(Prisma.sql`
        select posts.id, posts.title, SUM(score) as score from post_scores
        inner join posts on post_scores.fk_post_id = posts.id
        where post_scores.created_at > now() - interval '1 day' * ${selectedTimeframe[1]}
        and posts.released_at > now() - interval '1 day' * ${selectedTimeframe[1] * 1.5}
        group by posts.id
        order by score desc, posts.id desc
        offset ${offset}
        limit ${limit}
      `)) as { id: string; score: number }[]

      ids = rows.map((row) => row.id)
      this.cache.lruCache.set(cacheKey, ids)
    }

    const posts = await this.postsByIds(ids)
    const normalized = this.utils.normalize(posts)
    const ordered = ids.map((id) => normalized[id])
    return ordered
  }
}
