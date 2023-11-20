const jwtutils = require('./jwtutils')

module.exports = function (request, response, next) {
    // TODO: хз чо это, видел в уроке, мб убрать
    if(request.method === 'OPTIONS') {
        next()
    }

    try {
        const authorizationHeaderValue = request.headers.authorization
        if(!authorizationHeaderValue)
            throw "Не указан JWT в заголовке Authorization"

        const jwtstring = authorizationHeaderValue.split(' ')[1]
        if(!jwtstring)
            throw 'Необходимо предоставить JWT в формате "Bearer {JWT}"'

        // если jwt токен будет невалидный, то бросит исключение
        request.user = jwtutils.verifyToken(jwtstring)

        next()
    } catch (e) {
        const message = `Ошибка на этапе аутентификации: ${e}`
        console.log(message)
        return response.status(403).json(message)
    }
}