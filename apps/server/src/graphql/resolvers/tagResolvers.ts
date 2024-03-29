import { Resolvers } from '@graphql/helpers/generated'
import { TagService } from '@services/TagService/index.js'
import { container } from 'tsyringe'

const tagResolvers: Resolvers = {
  Query: {
    userTags: async (_, { input }, ctx) => {
      const tagService = container.resolve(TagService)
      return await tagService.getUserTags(input.username, ctx.user?.id)
    },
  },
}

export default tagResolvers
