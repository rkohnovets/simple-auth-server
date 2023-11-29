// validRoles - список ролей, которые должен проверять создаваемый мидлвар
// например, ['ADMIN'] или ['USER', 'ADMIN']
const roleMiddlewareFactory = (validRoles) => {
    // создаем мидлвар, который проверяет на наличие ролей
    const roleMiddleware = (request, response, next) => {
        try {
            // перед этим должен быть поставлен
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
    return roleMiddleware
}
module.exports = roleMiddlewareFactory