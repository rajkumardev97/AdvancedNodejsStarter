const db = require('../connections/dbMaster');
const { RateLimiterMongo } = require('rate-limiter-flexible');
const { handleError } = require('../utils/requestHandlers')
const opts = {
    storeClient: db,
    points: 2, // Number of points
    duration: 1, // Per second(s)
};

const rateLimiter = new RateLimiterMongo(opts);



module.exports = async (req, res, next) => {
    try {
        console.log(`ip is ${req.ip}`);
        await rateLimiter.consume(req.ip, 1);
        next();
    } catch (error) {
        console.error(error.message || error);
        handleError({ res, err: "Too many requests", statusCode: 429 });
    }
};