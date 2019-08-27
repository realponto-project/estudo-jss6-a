const router = require('express').Router({ mergeParams: true })
const typeAccountController = require('../../controllers/typeAccount')

router.post('', typeAccountController.add)
router.get('', typeAccountController.getAll)
router.get('/getResourcesByTypeAccount', typeAccountController.getResourcesByTypeAccount)

module.exports = router
