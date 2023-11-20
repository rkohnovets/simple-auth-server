module.exports = function (validRoles) {
    return function (request, response, next) {
        try {
            // по идее, до этого сработал мидлвар аутентификации
            // соответственно JWT есть в любом случае

            // создаём переменную userRoles со значением из свойства roles, тип того
            const { roles: userRoles } = request.user

            let hasValidRole = userRoles.some(role => validRoles.includes(role))
            if(!hasValidRole)
                throw "Нет подходящих ролей"

            next()
        }
        catch (e) {
            const message = `Ошибка на этапе авторизации: ${e}`
            console.log(message)
            return response.status(403).json(message)
        }
    }
}