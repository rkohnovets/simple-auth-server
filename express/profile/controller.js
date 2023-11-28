const bcrypt = require('bcrypt')

const { User, isAboutValid, isNameValid, isPasswordValid, isUsernameValid } = require('../../models/User')
const Role = require('../../models/Role')
const config = require('../../config')
const jwtutils = require('../../utils/jwtUtils')

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
    // (могло быть name например, но сделал так)
    const roleslist = user.roles.map(role => role.value)
    const payload = {
        id: user._id,
        roles: roleslist
    }
    return jwtutils.signToken(payload)
}

const getUserByFilter = async (filter) => await User
    .findOne(filter)
    .populate('roles')
    .exec()
const getUserById = async (id) => await getUserByFilter({ _id: id })
const getUserByUsername = async (username) => await getUserByFilter({ username: username })

const createCommonUser = async (username, passwordHash) => {
    const role = await Role.findOne({ value: 'USER' })
    const newUser = new User({
        username: username,
        password: passwordHash,
        roles: [ role ]
    })
    await newUser.save()
    return newUser
}

const getUserInfo = (user) => {
    return {
        id: user._id,
        username: user.username,
        roles: user.roles.map(role => role.value),
        name: user.name ?? "",
        about: user.about ?? ""
    }
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
            const body = await request.body // JSON
            const { username, password } = body

            // если что-то не так с юзернеймом или паролем,
            // то бросит исключение
            isUsernameValid(username)
            isPasswordValid(password)

            const user = await User.findOne({ username: username })
            if(user)
                throw 'Уже существует пользователь с таким же юзернеймом'

            const passwordHash = bcrypt.hashSync(password, 7)
            const createdUser = await createCommonUser(username, passwordHash)

            const userInfo = getUserInfo(createdUser)
            const jwt = generateAccessToken(createdUser)

            return response.json({
                user: userInfo,
                jwt: jwt
            })
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
    async login(request, response) {
        try {
            const body = await request.body // JSON
            const { username, password } = body

            const user = await getUserByUsername(username)
            if(!user)
                throw 'Пользователя с данным юзернеймом не найдено'

            const validPassword = bcrypt.compareSync(password, user.password)
            if(!validPassword)
                throw 'Неверный пароль'

            const userInfo = getUserInfo(user)
            const jwt = generateAccessToken(user)

            return response.json({
                user: userInfo,
                jwt: jwt
            })
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
    async userinfo(request, response) {
        try {
            // перед этим отрабатывает userMiddleware,
            // поэтому можем получить request.user (payload JWT)
            const { id, roles } = request.user

            const user = await getUserById(id)
            if(!user)
                throw "Корректный JWT, но пользователь с таким id не найден"

            const userInfo = getUserInfo(user)
            return response.json({
                user: userInfo
            })
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
    async refreshjwt(request, response) {
        try {
            // перед этим отрабатывает userMiddleware,
            // поэтому можем получить request.user (payload JWT)
            const { id, roles } = request.user

            const user = await getUserById(id)
            if(!user)
                throw "Корректный JWT, но пользователь с таким id не найден"

            const jwt = generateAccessToken(user)

            return response.json({
                jwt: jwt
            })
        }
        catch (e) {
            exceptionHandler(e, request, response)
        }
    }
}

module.exports = new controller()