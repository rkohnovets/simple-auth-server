module.exports = function (validRoles) {
    return function (request, response, next) {
        try {
            // по идее, до этого сработал мидлвар аутентификации
            // (если всё правильно написано в authRouter)
            // соответственно в request.user есть payload JWT-шки
            const { id, roles } = request.user

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