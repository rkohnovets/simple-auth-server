const Router = require('express')

const controller = require('./controller')
const authMiddleware = require('../shared/authMiddleware')

const router = Router()

router.get('/public-key', controller.getPublicKey)
router.post('/register', controller.register)
router.post('/login', controller.login)
router.get('/refresh-jwt', authMiddleware, controller.refreshJWT)
router.post('/change-password', authMiddleware, controller.changePassword)

/*
// только для 1) аутентифицированных 2) админов
// (комбинирование двух мидлверов)
const roleMiddlewareFactory = require('../shared/roleMiddlewareFactory')
const adminRoleMiddleware = roleMiddlewareFactory(['ADMIN'])
router.get(
    '/test',
    [authMiddleware, adminRoleMiddleware],
    controller.getPublicKey
)
*/

module.exports = router