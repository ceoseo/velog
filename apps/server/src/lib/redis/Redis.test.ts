import { container } from 'tsyringe'
import { RedisService } from './RedisService.js'

describe('RedisService', () => {
  const service = container.resolve(RedisService)
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
