# puregram-redis-storage

[![NPM version][npm-v]][npm-url]
[![NPM downloads][npm-downloads]][npm-url]
<!-- [![Build Status][build]][build-url] -->

✈️ Redis storage for [@puregram/session](https://github.com/nitreojs/puregram/tree/lord/packages/session) module

> Powered by [ioredis](https://github.com/luin/ioredis) <br />
> Based on [vk-io-redis-storage](https://github.com/xTCry/vk-io-redis-storage)

## Installation
```bash
yarn add puregram-redis-storage
```
```bash
npm i puregram-redis-storage
```

### Example usage
```js
const { Telegram } = require('puregram');
const { SessionManager } = require('@puregram/session');
const { RedisStorage } = require('puregram-redis-storage');

const telegram = Telegram.fromToken(process.env.TOKEN);

function startBot({ updates }) {
    const storage = new RedisStorage({
        // redis: ioRedisClient,
        redis: {
            host: '127.0.0.1',
        },
        keyPrefix: 'puregram:session:',
        // ttl: 12 * 3600,
    });

    const sessionManager = new SessionManager({
        storage,
        getStorageKey: (ctx) =>
            ctx.userId
                ? `${ctx.userId}:${ctx.userId}`
                : `${ctx.peerId}:${ctx.senderId}`,
    });

    updates.on('message', sessionManager.middleware);

    updates.on('message_new', (ctx, next) => {
        if (context.text !== '/counter') {
            return next();
        }
        if (ctx.isOutbox) return;

        const { session } = ctx;

        session.counter = (session.counter || 0) + 1;

        ctx.send(`You turned to the bot (${session.counter}) times`);
    });

    updates.start().catch(console.error);
}

// ...
startBot(telegram);
```

[npm-v]: https://img.shields.io/npm/v/puregram-redis-storage.svg?style=flat-square
[npm-downloads]: https://img.shields.io/npm/dt/puregram-redis-storage?label=used%20by&style=flat-square
[npm-url]: https://www.npmjs.com/package/puregram-redis-storage

[node]: https://img.shields.io/node/v/puregram-redis-storage.svg?style=flat-square
[node-url]: https://nodejs.org

[build]: https://img.shields.io/travis/puregram-redis-storage.svg?style=flat-square
[build-url]: https://travis-ci.org/puregram-redis-storage
