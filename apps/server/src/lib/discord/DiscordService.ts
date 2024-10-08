import { injectable, singleton } from 'tsyringe'
import { Client, GatewayIntentBits } from 'discord.js'
import { ENV } from '@env'
import { Time } from '@constants/TimeConstants.js'
import { RedisService } from '@lib/redis/RedisService.js'

@injectable()
@singleton()
export class DiscordService {
  private client!: Client
  public isSending: boolean = false
  constructor(private readonly redis: RedisService) {}
  public connection(): Promise<Client> {
    return new Promise((resolve) => {
      this.client = new Client({
        intents: [GatewayIntentBits.MessageContent],
      })

      this.client.on('ready', () => {
        console.log('Discord Client ready')
        resolve(this.client)
      })
      this.client.login(ENV.discordBotToken)
    })
  }
  public async sendMessage(type: MessageType, payload: MessagePayload | string) {
    this.isSending = true

    let message: string = ''
    if (typeof payload === 'string') {
      message = payload
    } else {
      const metaData = Object.assign(payload, {
        body: payload.body ?? 'none',
        query: payload.query ?? 'none',
      })
      message = JSON.stringify(metaData)
    }

    const frequentWord = [
      'connection pool',
      'canceling statement',
      'Not allow origin',
      'Unknown query',
      'ECONNRESET',
      'https://oauth2.googleapis.com',
      '/api/posts/v1/score',
      'Code is required',
      `notificationCount`,
    ]
    const isFrequentWordIncluded = frequentWord.some((word) => message.includes(word))

    if (isFrequentWordIncluded) {
      this.isSending = false
      console.log('Frequent word included skip sending message')
      return
    }

    if (typeof payload === 'object' && message.includes('WritePost') && payload?.user?.id) {
      const key = this.redis.generateKey.errorMessageCache(payload.type, payload?.user?.id)
      const exists = await this.redis.exists(key)
      if (exists === 1) return
      await this.redis.setex(key, Time.ONE_MINUTE_IN_S * 10, 'true')
    }

    try {
      const isReady = this.client.isReady()

      if (!isReady) {
        throw new Error('Discord bot is not ready')
      }

      const channelMapper: Record<MessageType, string> = {
        error: ENV.discordErrorChannel,
        spam: ENV.discordSpamChannel,
      }

      const channelId = channelMapper[type]

      if (!channelId) {
        throw new Error('Not found discord channel id')
      }

      const channel = await this.client.channels.fetch(channelId)

      if (channel?.isTextBased()) {
        const chunkSize = 2000
        for (let i = 0; i < message.length; i += chunkSize) {
          await channel.send(message.slice(i, i + chunkSize))
        }
      } else {
        throw new Error('Wrong channel type')
      }
    } catch (error: any) {
      console.log(error)
      throw new Error('Failed to send meesage to discord channel')
    } finally {
      this.isSending = false
    }
  }
}

export type MessageType = 'error' | 'spam'
export type MessagePayload = {
  type: string
  body?: any
  query?: any
  user?: { id: string }
  ip?: string
  error?: any
  originError?: any
}
