const { createClient } = require('redis')

const redisClient = createClient({
    url: process.env.REDIS_URL
})

const client = createClient()
  .on('error', (err) => console.log('Redis Client Error', err))
  .on('connect', () => console.log('Socket connection opened...'))
  .on('ready', () => console.log('Redis client is ready!'));

(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.error('Could not connect to Redis:', err);
    }
})();

module.exports = client;