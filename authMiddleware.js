const config = require('./config')
const jwtutils = require('./jwtutils')

module.exports = function (request, response, next) {
    if(request.method === 'OPTIONS') {
        next()
    }

    try {
        const authorizationHeaderValue = request.headers.authorization
        if(!authorizationHeaderValue)
            throw "Не указан JWT в заголовке Authorization"

        const jwtstring = authorizationHeaderValue.split(' ')[1]
        if(!jwtstring)
            throw 'Необходимо предоставить JWT токен'

        // если jwt токен будет невалидный, то бросит исключение
        const decodedPayload = jwtutils.verifyToken(jwtstring)
        request.user = decodedPayload

        next()
    } catch (e) {
        const message = `Ошибка на этапе аутентификации: ${e}`
        console.log(message)
        return response.status(403).json(message)
    }
}