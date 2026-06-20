const errorTable = {
    "BAD_REQUEST": { statusCode: 400, message: "Bad request." },
    "UNAUTHORIZED": { statusCode: 401, message: "Unauthorized." },
    "FORBIDDEN": { statusCode: 403, message: "Forbidden." },
    "NOT_FOUND": { statusCode: 404, message: "Not found." },
    "USER_ALREADY_EXISTS": { statusCode: 409, message: "User already exists." },
    "UNPROCESSABLE_CONTENT": { statusCode: 422, message: "Unprocessable content." },
}

function errorMap(errorKey){
    return errorTable[errorKey] || { statusCode: 500, message: "Internal server error." }
}

module.exports = { errorMap }