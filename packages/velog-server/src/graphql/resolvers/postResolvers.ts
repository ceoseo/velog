import { Resolvers } from '@graphql/generated'
import { container } from 'tsyringe'
import { PostService } from '@services/PostService/index.js'
import { UserService } from '@services/UserService/index.js'
import { PostIncludeComment, PostIncludeUser } from '@services/PostService/PostServiceInterface.js'
import { CommentService } from '@services/CommentService/index.js'
import { Post, Tag } from '@prisma/client'
import { PostLikeService } from '@services/PostLikeService/index.js'
import { DbService } from '@lib/db/DbService.js'

import { SeriesService } from '@services/SeriesService/index.js'
import { TagService } from '@services/TagService/index.js'
import { FollowService } from '@services/FollowService/index.js'

const postResolvers: Resolvers = {
  Post: {
    user: async (parent: PostIncludeUser) => {
      if (!parent.user) {
        const userService = container.resolve(UserService)
        return await userService.getCurrentUser(parent.fk_user_id)
      }
      return parent?.user
    },
    short_description: (parent) => {
      const postService = container.resolve(PostService)
      return postService.shortDescription(parent)
    },
    comments: async (parent: PostIncludeComment) => {
      if (parent.comments) return parent.comments
      const commentService = container.resolve(CommentService)
      const commentsLoader = commentService.commentsLoader()
      return await commentsLoader.load(parent.id)
    },
    comments_count: async (parent: PostIncludeComment) => {
      if (parent?.comments) return parent.comments.length
      const commentService = container.resolve(CommentService)
      const count = await commentService.count(parent.id)
      return count
    },
    tags: async (parent: Post) => {
      const tagService = container.resolve(TagService)
      const tagLoader = tagService.tagLoader()
      const tags = await tagLoader.load(parent.id)
      return tags.map((tag: Tag) => tag.name!)
    },
    series: async (parent) => {
      const seriesService = container.resolve(SeriesService)
      return await seriesService.getSeriesByPostId(parent.id)
    },
    is_liked: async (parent: Post, _, ctx) => {
      if (!ctx.user) return false
      const db = container.resolve(DbService)
      const liked = await db.postLike.findFirst({
        where: {
          fk_post_id: parent.id,
          fk_user_id: ctx.user.id,
        },
      })
      return !!liked
    },
    recommended_posts: async (parent: Post) => {
      const postService = container.resolve(PostService)
      return await postService.recommendedPosts(parent)
    },
    is_followed: async (parent: Post, _, ctx) => {
      if (!ctx.user) return false
      const followService = container.resolve(FollowService)
      return await followService.isFollowed({
        followingUserId: parent.fk_user_id,
        followerUserId: ctx.user.id,
      })
    },
  },
  Query: {
    post: async (_, { input }, ctx) => {
      const postService = container.resolve(PostService)
      return await postService.getPost(input, ctx.user?.id)
    },
    recentPosts: async (_, { input }, ctx) => {
      const postService = container.resolve(PostService)
      return await postService.getRecentPosts(input, ctx.user?.id)
    },
    trendingPosts: async (_, { input }, ctx) => {
      const postService = container.resolve(PostService)
      return await postService.getTrendingPosts(input, ctx.ip)
    },
    readingList: async (_, { input }, ctx) => {
      const postService = container.resolve(PostService)
      return await postService.getReadingList(input, ctx.user?.id)
    },
    posts: async (_, { input }, ctx) => {
      console.log('hello', input)
      const postService = container.resolve(PostService)
      return await postService.getPosts(input, ctx.user?.id)
    },
    searchPosts: async (_, { input }, ctx) => {
      const postService = container.resolve(PostService)
      return await postService.getSeachPost(input, ctx.user?.id)
    },
  },
  Mutation: {
    likePost: async (_, { input }, ctx): Promise<Post> => {
      const postLikeService = container.resolve(PostLikeService)
      return await postLikeService.likePost(input.postId, ctx.user?.id)
    },
    unlikePost: async (_, { input }, ctx): Promise<Post> => {
      const postLikeService = container.resolve(PostLikeService)
      return await postLikeService.unlikePost(input.postId, ctx.user?.id)
    },
  },
}

export default postResolvers
