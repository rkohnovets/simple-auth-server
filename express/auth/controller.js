const { User, userValidation, getUserByFilter, createUser } = require('../../models/User')
const config = require('../../config')
const jwtUtils = require('../../utils/jwtUtils')
const passwordUtils = require('../../utils/passwordUtils')
const { exceptionHandler } = require('../shared/exceptionHandler')

const generateAccessToken = (user) => {
    // value - это просто такое название свойства
    // (могло быть 'name' например, но сделал так)
    const roleslist = user.roles.map(role => role.value)
    const payload = {
        id: user._id,
        roles: roleslist
    }
    return jwtUtils.signToken(payload)
}

const getUserById = async (id) => await getUserByFilter({ _id: id })
const getUserByUsername = async (username) => await getUserByFilter({ username: username })

class controller {
    async publickey(request, response) {
        try {
            return response.json({ publicKey: config.publicKey })
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

            const user = await User.findOne({ username: username })
            if(user)
                throw 'Уже существует пользователь с таким же юзернеймом'

            const passwordHash = passwordUtils.hashPassword(password)
            const createdUser = await createUser(username, passwordHash)
            const accessToken = generateAccessToken(createdUser)

            return response.json({ jwt: accessToken })
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
    async login(request, response) {
        try {
            const body = await request.body
            const { username, password } = body

            const user = await getUserByUsername(username)
            if(!user)
                throw 'Пользователя с данным юзернеймом не найдено'

            const validPassword = passwordUtils.checkPassword(password, user.passwordHash)
            if(!validPassword)
                throw 'Неверный пароль'

            const accessToken = generateAccessToken(user)

            return response.json({ jwt: accessToken })
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
    async refreshjwt(request, response) {
        try {
            // перед этим должен отработать authMiddleware (см. router.js), который
            // установит в поле user пэйлоад представленного пользователем JWT токена
            const { id, roles } = request.user

            const user = await getUserById(id)
            if(!user)
                throw "Ошибка: получен валидный JWT, но пользователь с таким id не найден"

            const accessToken = generateAccessToken(user)

            return response.json({ jwt: accessToken })
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
    async changepass(request, response) {
        try {
            // перед этим должен отработать authMiddleware (см. router.js), который
            // установит в поле user пэйлоад представленного пользователем JWT токена
            const {id, roles} = request.user
            const {oldpass, newpass} = await request.body

            if(oldpass === newpass)
                throw "USERMESSAGE Введенные пароли не должны совпадать"

            const user = await getUserById(id)
            if (!user)
                throw "Ошибка: получен валидный JWT, но пользователь с предоставленным id не найден"

            const validPassword = passwordUtils.checkPassword(oldpass, user.passwordHash)
            if (!validPassword)
                throw "USERMESSAGE Старый пароль введен неправильно"

            // если что-то не так, то бросит исключение
            userValidation.password(newpass)

            user.passwordHash = passwordUtils.hashPassword(newpass)
            await user.save()

            return response.json({ message: 'Password changed' })
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
}

module.exports = new controller()