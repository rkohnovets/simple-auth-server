const { User, userGetting, userValidation, formUserInfoToSend } = require('../../models/User')
const Role = require('../../models/Role')
const { exceptionHandler } = require('../shared/exceptionHandler')

class controller {
    async getProfile(request, response) {
        try {
            // см. router.js
            const usernameParam = request.params.username

            // даже если в запросе заголовок 'Fields',
            // то приведет к нижнему регистру
            const fieldsString = request.headers['fields']
            //console.log(JSON.stringify(request.headers))
            let fields = null
            if(fieldsString) {
                const fieldsArr = fieldsString.split(',')
                fields = {}
                for (const fieldName of fieldsArr)
                    fields[fieldName] = 1
            }

            let user = null
            if(usernameParam) {
                // 1) ищем по юзернейму (аутентификация не нужна)
                // бросит исключение, если что-то не так
                userValidation.username(usernameParam)
                user = await userGetting.byUsername(usernameParam)
            } else {
                // 2) ищем по айдишнику из JWT
                const { id, roles } = request.user
                user = await userGetting.byId(id)
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
                // 1) по юзернейму (только для админов, см. router.js)
                admin = true
                userValidation.username(usernameParam)
                user = await userGetting.byUsername(usernameParam)
            } else {
                // 2) по айдишнику из JWT
                const { id, roles } = request.user
                user = await userGetting.byId(id)
            }

            if(!user)
                throw 'USERMESSAGE Пользователь не найден'

            if(id)
                throw 'Ошибка: попытка поменять id пользователя'

            if(username) {
                userValidation.username(username)

                const userWithTheSameUsername = userGetting.byUsername(username)

                if(userWithTheSameUsername)
                    throw 'USERMESSAGE Данный юзернейм занят'

                user.username = username
            }

            if(roles) {
                if(admin) {
                    user.roles = []
                    for(const roleStr of roles) {
                        const role = await Role.findOne({ name: roleStr })
                        if(!role)
                            throw `USERMESSAGE Не найдена роль с названием "${roleStr}"`
                        user.roles.append(role)
                    }
                }
                else
                    throw 'Ошибка: Менять список ролей пользователя могут только администраторы'
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