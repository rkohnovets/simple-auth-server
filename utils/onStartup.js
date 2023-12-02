const { User, userValidation, userGetting, formUserInfoToSend, createUser } = require('../models/User')
const Role = require('../models/Role')
const passwordUtils = require('./passwordUtils')

// стандартные пользователи и роли
const onStartup = async () => {
    // 1) роли
    {
        let userRole = await Role.findOne({ name: 'USER' })
        if(!userRole) {
            userRole = new Role({
                name: 'USER'
            })
            await userRole.save()
        }
    }
    {
        let adminRole = await Role.findOne({ name: 'ADMIN' })
        if(!adminRole) {
            adminRole = new Role({
                name: 'ADMIN'
            })
            await adminRole.save()
        }
    }
    // 2) пользователи
    {
        let testCommonUser = await userGetting.byUsername('user')
        if(testCommonUser)
            await User.deleteOne({ username: 'user' })
        const password = 'user'
        const passwordHash = passwordUtils.hashPassword(password)
        testCommonUser = createUser('user', passwordHash)
        testCommonUser.name = 'Name Surname'
        testCommonUser.about = 'This is my test user'
    }
    {
        let adminCommonUser = await userGetting.byUsername('admin')
        if(adminCommonUser)
            await User.deleteOne({ username: 'admin' })
        const password = 'admin'
        const passwordHash = passwordUtils.hashPassword(password)
        adminCommonUser = createUser('admin', passwordHash, ['USER', 'ADMIN'])
    }
}

module.exports = onStartup