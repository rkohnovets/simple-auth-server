const { Schema, model } = require('mongoose')
const Role = require("./Role");

const UserSchema = new Schema({
    // неявно создастся поле _id
    username: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
    name: { type: String },
    about: { type: String },
    // TODO: будет идентификатор в коллекции файлов файлового сервера
    image: { type: Schema.Types.ObjectId }
})

const validateUsername = (username) => {
    const requirements =
        'Usernames can only have:' +
        '\n' + ' - Lowercase Letters (a-z)' +
        '\n' + ' - Uppercase Letters (A-Z)' +
        '\n' + ' - Numbers (0-9)' +
        '\n' + 'Usernames should have length from 3 to 15'

    const res = /^[a-zA-Z0-9]{3,15}$/.exec(username);
    const valid = !!res;

    //return valid;
    if(!valid)
        throw `USERMESSAGE ${requirements}`
}
const validatePassword = (password) => {
    const requirements =
        'Passwords can only have:' +
        '\n' + ' - Lowercase Letters (a-z)' +
        '\n' + ' - Uppercase Letters (A-Z)' +
        '\n' + ' - Numbers (0-9)' +
        '\n' + 'Passwords should have length from 3 to 15'

    const res = /^[a-zA-Z0-9]{3,15}$/.exec(password);
    const valid = !!res;

    //return valid;
    if(!valid)
        throw `USERMESSAGE ${requirements}`
}
const validateName = (name) => {
    const requirements =
        'Name can only have:' +
        '\n' + ' - Lowercase Letters (a-z)' +
        '\n' + ' - Uppercase Letters (A-Z)' +
        '\n' + ' - Spaces' +
        '\n' + 'Name should have length 0 to 50'

    const res = /^[a-zA-Z ]{0,50}$/.exec(name);
    const valid = !!res;

    //return valid;
    if(!valid)
        throw `USERMESSAGE ${requirements}`
}
const validateAbout = (about) => {
    const requirements =
        'About can only have:' +
        '\n' + ' - Lowercase Letters (a-z)' +
        '\n' + ' - Uppercase Letters (A-Z)' +
        '\n' + ' - Spaces' +
        '\n' + 'About should have length 0 to 500'

    const res = /^[a-zA-Z ]{0,500}$/.exec(about);
    const valid = !!res;

    //return valid;
    if(!valid)
        throw `USERMESSAGE ${requirements}`
}

const User = model('User', UserSchema)

const createUser = async (username, passwordHash, rolesStrings = ['USER']) => {
    const roles = []
    for(const roleStr of rolesStrings) {
        const role = await Role.findOne({ name: roleStr })
        if(!role)
            throw `Ошибка: запрошенной для создания пользователя роли ${roleStr} нет в БД`
        roles.push(role)
    }
    const newUser = new User({
        username: username,
        passwordHash: passwordHash,
        roles: roles
    })
    await newUser.save()
    return newUser
}

const getUserByFilter = async (filter) => {
    const result = await User
        .findOne(filter)
        .populate('roles')
        .exec()
    return result
}
const getUserById = async (id) => await getUserByFilter({ _id: id })
const getUserByUsername = async (username) => await getUserByFilter({ username: username })

const formUserInfoToSend = (user, fields = null) => {
    fields = fields ?? {
        id: 1,
        username: 1,
        roles: 1,
        name: 1,
        about: 1
    }

    const result = {}

    if('id' in fields)
        result.id = user._id
    if('username' in fields)
        result.username = user.username
    if('roles' in fields)
        result.roles = user.roles.map(role => role.name)
    if('name' in fields)
        result.name = user.name ?? ""
    if('about' in fields)
        result.about = user.about ?? ""

    return result
}

const getUsersByQuery = async (query) => {
    if(query.length < 1)
        throw 'USERMESSAGE Пустой запрос для поиска'

    const result = []

    try {
        const byId = await getUserById(query)
        if(byId)
            result.push(byId)
    }
    catch {
    }

    const byUsername = await User.aggregate([
            { $match: { username: { $regex: query, $options:'i' } } },
            { $limit: 100 }
        ])
        .exec()

    if (byUsername)
        result.push(...byUsername)

    const byName = await User.aggregate([
        { $match: { name: { $regex: query, $options: 'i' } } },
        { $limit: 100 }
    ]).exec()

    if (byName)
        result.push(...byName)

    return result
}

module.exports = {
    User,
    createUser,
    formUserInfoToSend,
    userGetting: {
        byFilter: getUserByFilter,
        byId: getUserById,
        byUsername: getUserByUsername,
        byQuery: getUsersByQuery
    },
    userValidation: {
        username: validateUsername,
        password: validatePassword,
        name: validateName,
        about: validateAbout
    }
}