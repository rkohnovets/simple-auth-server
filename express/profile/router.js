const Router = require('express')

const controller = require('./controller')
const authMiddleware = require('../shared/authMiddleware')
const roleMiddlewareFactory = require('../shared/roleMiddlewareFactory')

const router = Router()

router.get('/', authMiddleware, controller.getProfile)
router.get('/find', authMiddleware, controller.getUsersByQuery)
router.get('/username/:username', controller.getProfile)
router.get('/id/:id', controller.getProfile)
router.post('/', authMiddleware, controller.setProfile)

const adminRoleMiddleware = roleMiddlewareFactory(['ADMIN'])
router.post(
    '/:username',
    [authMiddleware, adminRoleMiddleware],
    controller.setProfile
)

module.exports = router