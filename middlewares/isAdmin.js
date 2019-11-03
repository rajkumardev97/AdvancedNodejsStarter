const { handleError } = require('../utils/requestHandlers')
module.exports = async ({ user: { isAdmin } }, res, next) => {
    try {
        if(isAdmin) return next()
        throw "Only Admin Allowed to access this";
    }
    catch (err) {
        handleError({ res, err, statusCode: 401 })
    }
}