import { SessionStorage } from '@puregram/session';
import createDebug from 'debug';
import Redis, { RedisOptions } from 'ioredis';

export type IRedisStorageOptions = {
  redis?: string | Omit<RedisOptions, 'keyPrefix'> | Redis;
  ttl?: number;
  keyPrefix?: RedisOptions['keyPrefix'];
};

const debug = createDebug('puregram:redis-store');

export class RedisStorage implements SessionStorage {
  public readonly client: Redis;
  public readonly ttl: number = 0;

  constructor(options: IRedisStorageOptions = {}) {
    if (options.ttl) {
      this.ttl = options.ttl;
    }

    if (options.redis instanceof Redis) {
      this.client = options.redis;
    } else if (typeof options.redis === 'string') {
      this.client = new Redis(options.redis, {
        keyPrefix: options.keyPrefix || 'puregram:session:'
      });
    } else {
      this.client = new Redis({
        ...options.redis,
        keyPrefix: options.keyPrefix || 'puregram:session:'
      });
    }
  }

  public async get(key: string): Promise<object | undefined> {
    const value: object = await this.client
      .get(key)
      .then((value) => JSON.parse(value ?? '{}'))
      .catch(() => ({}));

    debug('session state', key, value);
    return value;
  }

  public async set(key: string, value: object): Promise<boolean> {
    const json = JSON.stringify(value);
    if (!json || json === '{}') {
      return this.delete(key);
    }

    debug('save session', key, json);
    const result = await this.client.set(key, json);

    if (this.ttl) {
      debug('set session ttl', this.ttl);
      await this.client.expire(key, this.ttl);
    }

    return result === 'OK';
  }

  public async delete(key: string): Promise<boolean> {
    debug('delete session', key);

    const result = await this.client.del(key);
    return result === 1;
  }

  public async touch(key: string): Promise<void> {
    if (!this.ttl) return;

    debug('touch session', key, this.ttl);
    await this.client.expire(key, this.ttl);
  }
}
