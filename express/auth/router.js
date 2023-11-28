const Router = require('express')

const controller = require('./controller')
const authMiddleware = require('../middlewares/authMiddleware')
const roleMiddlewareFactory = require('../middlewares/roleMiddlewareFactory')

const router = Router()

router.get('/publickey', controller.publickey)
router.post('/register', controller.register)
router.post('/login', controller.login)
router.get('/refreshjwt', authMiddleware, controller.refreshjwt)
router.post('/changepass', authMiddleware, controller.changepass)

// только для 1) аутентифицированных 2) админов
// (комбинирование двух мидлверов)
/*
const adminRoleMiddleware = roleMiddlewareFactory(['ADMIN'])
router.get(
    '/testCheckRole',
    [authMiddleware, adminRoleMiddleware],
    controller.userinfo
)
*/

module.exports = router