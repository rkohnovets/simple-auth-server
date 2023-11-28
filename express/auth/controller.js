const { User, isAboutValid, isNameValid, isPasswordValid, isUsernameValid } = require('../../models/User')
const Role = require('../../models/Role')
const config = require('../../config')
const jwtUtils = require('../../utils/jwtUtils')
const passwordUtils = require('../../utils/passwordUtils')

const exceptionHandler = (e, request, response) => {
    const exceptionString = `${e}`

    const devMessage = `Ошибка на сервере по пути ${request.path}: ${exceptionString}`
    console.log(devMessage)

    // решение не лучшее, но если проблемы с валидацией,
    // и нужно отправить пользователю сообщение, то строка начинается с 'USERMESSAGE'
    // (а фронт может обработать уже - вывести пользователю без этого префикса)
    const returnedMessage = exceptionString.startsWith('USERMESSAGE')
        ? exceptionString
        : '400: Ошибка на стороне сервера'

    response.status(400).json(returnedMessage)
}

const generateAccessToken = (user) => {
    // user - обьект монгусовской модели User
    // value - это просто такое название свойства
    // (могло быть 'name' например, но сделал так)
    const roleslist = user.roles.map(role => role.value)
    const payload = {
        id: user._id,
        roles: roleslist
    }
    return jwtUtils.signToken(payload)
}

const getUserByFilter = async (filter) =>
    await User
        .findOne(filter)
        .populate('roles')
        .exec()
const getUserById = async (id) => await getUserByFilter({ _id: id })
const getUserByUsername = async (username) => await getUserByFilter({ username: username })

const createCommonUser = async (username, passwordHash) => {
    const role = await Role.findOne({ value: 'USER' })
    const newUser = new User({
        username: username,
        passwordHash: passwordHash,
        roles: [ role ]
    })
    await newUser.save()
    return newUser
}


class controller {
    async publickey(request, response) {
        try {
            return response.json({
                publicKey: config.publicKey
            })
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
            isUsernameValid(username)
            isPasswordValid(password)

            const user = await User.findOne({ username: username })
            if(user)
                throw 'Уже существует пользователь с таким же юзернеймом'

            const passwordHash = passwordUtils.hashPassword(password)
            const createdUser = await createCommonUser(username, passwordHash)
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

            const validPassword = passwordUtils.validatePassword(password, user.passwordHash)
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
                throw "Ошибка: получен валидный JWT, но пользователь с таким id не найден"

            const validPassword = passwordUtils.validatePassword(oldpass, user.passwordHash)
            if (!validPassword)
                throw "USERMESSAGE Неверный пароль"

            // если что-то не так, то бросит исключение
            isPasswordValid(newpass)

            user.passwordHash = passwordUtils.hashPassword(newpass)
            await user.save()

            return response.json({message: 'Password changed'})
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
}

module.exports = new controller()