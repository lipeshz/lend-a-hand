const { errorMap } = require('./errorMap')

function responseErrorController(res, result){
    const { statusCode, message } = errorMap(result.error)
    return res.status(statusCode).json({
        status: "error",
        message,
        ...(result.labels && { labels: result.labels})
    })
    
}

module.exports = { responseErrorController }