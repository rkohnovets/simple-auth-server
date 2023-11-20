const bcrypt = require('bcrypt')

const User = require('./mongoose models/User')
const Role = require('./mongoose models/Role')
const config = require('./config')
const jwtutils = require('./jwtutils')

const exceptionHandler = (e, request, response) => {
    const devMessage = `Ошибка на сервере по пути ${request.path}: ${e}`
    const prodMessage = `400: Ошибка на стороне сервера`
    console.log(devMessage)
    let returnedMessage = config.development ? devMessage : prodMessage
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

const getUserById = async (id) => {
    const userFound = await User
        .findOne({ _id: id })
        .populate('roles')
        .exec()
    return userFound
}

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

class authController {
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

            const user = await User.findOne({ username: username })
            if(user)
                throw 'Уже существует пользователь с таким же юзернеймом'

            const passwordHash = bcrypt.hashSync(password, 7)
            const createdUser = await createCommonUser(username, passwordHash)

            const jwt = generateAccessToken(createdUser)

            return response.json({
                user: createdUser,
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

            const user = await User
                .findOne({ username: username })
                .populate('roles')
                .exec()
            if(!user)
                throw 'Пользователя с данным юзернеймом не найдено'

            const validPassword = bcrypt.compareSync(password, user.password)
            if(!validPassword)
                throw 'Неверный пароль'

            const jwt = generateAccessToken(user)

            return response.json({
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

            return response.json({
                id: user._id,
                username: user.username,
                roles: user.roles.map(role => role.value)
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

module.exports = new authController()