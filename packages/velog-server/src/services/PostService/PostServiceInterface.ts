import {
  PostInput,
  ReadingListInput,
  RecentPostsInput,
  TrendingPostsInput,
} from '@graphql/generated'
import { Post } from '@prisma/client'

export interface PostServiceInterface {
  getReadingList(input: ReadingListInput, userId: string | undefined): Promise<Post[]>
  // private getPostsByRead(input: GetPostsByTypeParams): Promise<Post[]>
  // private getPostsByLiked(input: GetPostsByTypeParams): Promise<Post[]>
  getRecentPosts(input: RecentPostsInput, userId: string | undefined): Promise<Post[]>
  getTrendingPosts(input: TrendingPostsInput, ip: string | null): Promise<Post[]>
  getPost(input: PostInput, userId: string | undefined): Promise<Post | null>
}

export type GetPostsByTypeParams = {
  cursor: string | undefined
  userId: string
  limit: number
}
