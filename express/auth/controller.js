const { User, userValidation, userGetting, formUserInfoToSend, createUser } = require('../../models/User')
const config = require('../../config')
const jwtUtils = require('../../utils/jwtUtils')
const passwordUtils = require('../../utils/passwordUtils')
const { exceptionHandler } = require('../shared/exceptionHandler')

const generateAccessToken = async (user) => {
    const payload = await formUserInfoToSend(user, { id: 1, roles: 1})
    return jwtUtils.signToken(payload)
}

class controller {
    async getPublicKey(request, response) {
        try {
            response.json({ publicKey: config.publicKey })
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
    async register(request, response) {
        try {
            const body = await request.body
            const { username, password } = body

            // если что-то не так, то бросит исключение
            userValidation.username(username)
            userValidation.password(password)

            const user = await userGetting.byUsername(username)
            if(user)
                throw 'USERMESSAGE Уже существует пользователь с таким же юзернеймом'

            const passwordHash = passwordUtils.hashPassword(password)
            const createdUser = await createUser(username, passwordHash)
            const accessToken = await generateAccessToken(createdUser)

            response.json(accessToken)
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
    async login(request, response) {
        try {
            const body = await request.body
            const { username, password } = body

            const user = await userGetting.byUsername(username)
            if(!user)
                throw 'USERMESSAGE Пользователя с данным юзернеймом не найдено'

            const validPassword = passwordUtils.checkPassword(password, user.passwordHash)
            if(!validPassword)
                throw 'USERMESSAGE Неверный пароль'

            const accessToken = await generateAccessToken(user)

            response.json(accessToken)
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
    async refreshJWT(request, response) {
        try {
            // перед этим должен отработать authMiddleware (см. router.js), который
            // установит в поле user пэйлоад представленного пользователем JWT токена
            const { id, roles } = request.user

            const user = await userGetting.byId(id)
            if(!user)
                throw "Ошибка: получен валидный JWT, но пользователь с таким id не найден"

            const accessToken = await generateAccessToken(user)

            response.json(accessToken)
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
    async changePassword(request, response) {
        try {
            // перед этим должен отработать authMiddleware (см. router.js), который
            // установит в поле user пэйлоад представленного пользователем JWT токена
            const { id, roles } = request.user
            const { oldPassword, newPassword } = await request.body

            if(oldPassword === newPassword)
                throw "USERMESSAGE Введенные пароли не должны совпадать"

            const user = await userGetting.byId(id)
            if (!user)
                throw "Ошибка: получен валидный JWT, но пользователь с предоставленным id не найден"

            const validPassword = passwordUtils.checkPassword(oldPassword, user.passwordHash)
            if (!validPassword)
                throw "USERMESSAGE Старый пароль введен неправильно"

            // если что-то не так, то бросит исключение
            userValidation.password(newPassword)

            user.passwordHash = passwordUtils.hashPassword(newPassword)
            await user.save()

            response.json({ message: 'Password changed' })
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
}

module.exports = new controller()