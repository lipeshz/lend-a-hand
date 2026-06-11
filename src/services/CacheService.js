const redisClient = require('../utils/redis')
const jwt = require('jsonwebtoken')

class CacheService{
    async blockToken(token){
        try{
            const decoded = jwt.decode(token)
            if(!decoded || decoded.exp) return;

            const nowInSeconds = Math.floor(Date.now()/1000);
            // Tempo de vida útil - tempo que resta
            const timeLeftInSeconds = decoded.exp - nowInSeconds

            if(timeLeftInSeconds <= 0) return;

            await redisClient.set(`blacklist:${token}`, '1', {
                EX: timeLeftInSeconds
            })
        }catch(error){
            console.error('Failed to blacklist token: ', error)
        }
    }

    async isTokenBlocked(token){
        const tokenExists = await redisClient.exists(`blacklist:${token}`);
        return exists === 1;
    }
}

module.exports = new CacheService();