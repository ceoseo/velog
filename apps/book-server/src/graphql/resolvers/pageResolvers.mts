import { Resolvers } from '@graphql/generated.js'
import { PageService } from '@services/PageService/index.mjs'
import { container } from 'tsyringe'

const pageResolvers: Resolvers = {
  Query: {
    pages: async (_, { input }, ctx) => {
      const pageService = container.resolve(PageService)
      return await pageService.getPages(input.book_url_slug, ctx.writer?.id)
    },
  },
  Mutation: {
    create: async (_, { input }, ctx) => {
      const pageService = container.resolve(PageService)
      const page = await pageService.create(input, ctx.writer?.id)
      console.log(page)
      return page
    },
  },
}

export default pageResolvers
