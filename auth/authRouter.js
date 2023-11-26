const Router = require('express')

const controller = require('./authController')
const authMiddleware = require('./authMiddleware')
const checkRoleMiddleware = require('./checkRoleMiddleware')

const router = Router()

router.get('/publickey', controller.publickey)
router.post('/register', controller.register)
router.post('/login', controller.login)
router.get('/userinfo', authMiddleware, controller.userinfo)
router.get('/refreshjwt', authMiddleware, controller.refreshjwt)
// типа только для админов
router.get('/testCheckRole', [authMiddleware, checkRoleMiddleware(['ADMIN'])], controller.userinfo)

module.exports = router