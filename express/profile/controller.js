const { User, getUserByFilter, userValidation, formUserInfoToSend } = require('../../models/User')
const Role = require('../../models/Role')
const { exceptionHandler } = require('../shared/exceptionHandler')

const getUserById = async (id) => await getUserByFilter({ _id: id })
const getUserByUsername = async (username) => await getUserByFilter({ username: username })

class controller {
    async getProfile(request, response) {
        try {
            // см. router.js
            const usernameParam = request.params.username

            const fieldsString = request.headers['Fields']
            let fields = null
            if(fieldsString) {
                const fieldsArr = fieldsString.split(',')
                fields = {}
                for (const fieldName of fieldsArr)
                    fields[fieldName] = 1
            }

            let user = null
            if(usernameParam) {
                // ищем по юзернейму (тогда аутентификация не нужна)

                // бросит исключение, если что-то не так
                userValidation.username(usernameParam)

                user = await getUserByUsername(usernameParam)
            } else {
                // ищем по айдишнику из JWT
                const { id, roles } = request.user
                user = await getUserById(id)
            }

            if(!user)
                throw 'USERMESSAGE Пользователь не найден'

            const result = formUserInfoToSend(user, fields)
            return response.json(result)
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
    async setProfile(request, response) {
        try {
            const { id, roles, username, name, about } = await request.body

            const usernameParam = request.params.username

            let user = null
            let admin = false
            if(usernameParam) {
                // по юзернейму только для админов (так настроил в router.js)\
                admin = true
                userValidation.username(usernameParam)
                user = await getUserByUsername(usernameParam)
            } else {
                // ищем по айдишнику из JWT
                const { id, roles } = request.user
                user = await getUserById(id)
            }

            if(!user)
                throw 'USERMESSAGE Пользователь не найден'

            if(id)
                throw 'USERMESSAGE id пользователя поменять нельзя'

            if(username) {
                userValidation.username(username)

                const userWithTheSameUsername = getUserByUsername(username)

                if(userWithTheSameUsername)
                    throw 'USERMESSAGE Данный юзернейм занят'

                user.username = username
            }

            if(roles) {
                if(admin) {
                    user.roles = []
                    for(const roleStr of roles) {
                        const role = await Role.findOne({ value: roleStr })
                        if(!role)
                            throw `USERMESSAGE Не найдена роль с названием "${roleStr}"`
                        user.roles.append(role)
                    }
                }
                else
                    throw 'USERMESSAGE Менять список ролей пользователя могут только администраторы'
            }

            if(name) {
                userValidation.name(name)
                user.name = name
            }

            if(about) {
                userValidation.about(about)
                user.about = about
            }

            await user.save()

            return response.json({ message: "User profile updated"})
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
}

module.exports = new controller()