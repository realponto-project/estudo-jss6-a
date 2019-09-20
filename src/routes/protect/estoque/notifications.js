const router = require('express').Router({ mergeParams: true })
const notificationControlle = require('../../../controllers/estoque/notifications')

router.get('', notificationControlle.getAll)
router.get('/has', notificationControlle.hasNotification)

module.exports = router
