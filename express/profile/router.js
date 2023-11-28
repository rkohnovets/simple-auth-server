const Router = require('express')

const controller = require('./controller')
const authMiddleware = require('../middlewares/authMiddleware')
const roleMiddlewareFactory = require('../middlewares/roleMiddlewareFactory')

const router = Router()

router.get('/profile', authMiddleware, controller.publickey)
router.get('/profile/:username', controller.publickey)
router.post('/profile', authMiddleware, controller.register)

const adminRoleMiddleware = roleMiddlewareFactory(['ADMIN'])
router.post(
    '/profile/:username',
    [authMiddleware, adminRoleMiddleware],
    controller.publickey
)

module.exports = router