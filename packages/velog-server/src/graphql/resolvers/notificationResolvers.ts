import { Resolvers } from '@graphql/helpers/generated'
import { NotificationService } from '@services/NotificationService'
import { container } from 'tsyringe'

const notificationResolvers: Resolvers = {
  Query: {
    notifications: async (_, __, ctx) => {
      const notificationService = container.resolve(NotificationService)
      return await notificationService.getNotifications(ctx.user?.id)
    },
    notificationCount: async (_, __, ctx) => {
      const notificationService = container.resolve(NotificationService)
      return await notificationService.getNotificationCount(ctx.user?.id)
    },
  },
  Mutation: {
    readNotification: async (_, { input }, ctx) => {
      const notificationService = container.resolve(NotificationService)
      return await notificationService.markNotificationsAsRead(input.notification_ids, ctx.user?.id)
    },
  },
}

export default notificationResolvers
