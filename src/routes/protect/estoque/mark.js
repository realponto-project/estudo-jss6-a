const router = require('express').Router({ mergeParams: true })
const markController = require('../../../controllers/estoque/product/mark')

router.post('', markController.add)
router.get('', markController.getAll)

module.exports = router
